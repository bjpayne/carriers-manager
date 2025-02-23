import './bootstrap';
import 'flowbite';
import {Dismiss} from "flowbite";
import {statesData} from './statesData.js';
import $ from 'jquery';
window.$ = $;
import validate from 'jquery-validation';
import mask from 'jquery-mask-plugin';
import _ from 'lodash';

let mapMarkers = {};
let allCarriers = [];

let currentCarrier = (function () {
    let pathName = window.location.pathname;

    let regexp = /(\/carrier\/)([0-9]*)/gm;
    let groups = [...pathName.matchAll(regexp)];

    if (groups.length > 0 && groups[0].length > 0) {
        return groups[0][2];
    }

    return null;
})();

axios.get('/carriers', )
    .then(function (response) {
        let carriers = response.data;

        let map = L.map('map').setView([37.8, -96], 5);

        let tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });

        tiles.addTo(map);

        carriers.forEach(function (carrier) {
            let markerIcon = L.Icon.extend({
                options: {
                    shadowUrl: 'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png',
                    iconSize:     [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor:  [2, -44]
                }
            });

            let marker = new markerIcon({iconUrl: 'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png'});

            let popup = L.popup()
                .setContent(`
                    <p><strong>Carrier:</strong> ${carrier.name}</p>
                    <p><strong>Address:</strong> ${carrier.address_1} ${carrier.address_2} ${carrier.city} ${carrier.state}, ${carrier.zip}</p>
                    <p><strong>Phone:</strong> <a href="tel:${carrier.phone}">${carrier.phone}</a></p>
                    <p><strong>Coverages</strong> ${carrier.carrier_coverages.map((_coverage) => { return _coverage.coverage}).join(', ')}</p>
                `
            );

            let mapMarker = L.marker([carrier.long, carrier.lat], {icon: marker}).bindPopup(popup);

            mapMarker.on('popupopen', function () {
                loadCarrier(carrier);
            });

            mapMarkers[carrier.id] = mapMarker;
            mapMarker.addTo(map);
            allCarriers.push(carrier);
        });

        if (mapMarkers.hasOwnProperty(currentCarrier)) {
            mapMarkers[currentCarrier].openPopup();
        }

        loadCoverages(map);
});

function loadCoverages(map) {
    axios.get('/coverages')
        .then(function (response) {
            let coverages = response.data;

            function mapCoverageStyle(feature) {
                let fillColor = '#949494';
                let fillOpacity = 0.5;

                if (coverages.hasOwnProperty(feature.properties.name)) {
                    let intersection = ['Auto', 'Home', 'Life'].filter(x => coverages[feature.properties.name].includes(x));

                    switch (intersection.length) {
                        case 3:
                            fillColor = '#329F5B';
                            fillOpacity = 0.5;

                            break;
                        case 2:
                        case 1:
                            fillColor = '#ffea1f';
                            fillOpacity = 0.5;

                            break;
                        case 0:
                        default:
                            break;
                    }
                }

                return {
                    fillColor: fillColor,
                    fillOpacity: fillOpacity,
                    stroke: false,
                }
            }

            let mapObject = L.geoJson(
                statesData,
                {
                    style: mapCoverageStyle
                }
            );

            mapObject.addTo(map);
        });
}

function loadCarrier(carrier) {
    $('#name').val(carrier.name);
    $('#dba').val(carrier.dba);
    $('#address-1').val(carrier.address_1);
    $('#address-2').val(carrier.address_2);
    $('#city').val(carrier.city);
    $('#state').val(carrier.state);
    $('#zip').val(carrier.zip);
    $('#phone').val(carrier.phone);
    $('#active').prop('checked', parseInt(carrier.active) === 1);
    $('#notes').val(carrier.notes);

    $('#coverages-auto').prop('checked', false);
    $('#coverages-home').prop('checked', false);
    $('#coverages-life').prop('checked', false);

    carrier.carrier_coverages.forEach(function (coverage) {
       switch (coverage.coverage) {
           case 'Auto':
               $('#coverages-auto').prop('checked', true);

               break;
           case 'Home':
               $('#coverages-home').prop('checked', true);

               break;
           case 'Life':
               $('#coverages-life').prop('checked', true);

               break;
           default:
               break;
       }
    });

    const url = `/carrier/${carrier.id}`;

    history.pushState("", "", url);

    $('#carriers-heading').html(`${carrier.name}`);
    $('#carrier-submit-button').html('Update carrier');

    let form = $('#add-carrier-form');

    form.prop('action', `/carrier/${carrier.id}`);
    $('<input type="hidden" name="_method" value="PUT">').prependTo(form);
}

function handleCoveragesGroupValidation(form) {
    if (form.find('#coverages-home').prop('checked') === false &&
        form.find('#coverages-auto').prop('checked') === false &&
        form.find('#coverages-life').prop('checked') === false
    ) {
        if ($('#coverages-grouping-error').length === 0) {
            $( "#coverages-grouping" ).prepend( '<p id="coverages-grouping-error" class="text-red-500 mb-1">Select at least one coverage</p>' );
        }

        return false;
    }

    return true;
}

$.validator.messages.required = 'required';

$('#phone').mask('000-000-0000', {placeholder: '___-___-____'});

$('#add-carrier-form').validate({
    errorClass: "invalid",
    invalidHandler: function (event, validator) {
        let form = $(event.target);

        return handleCoveragesGroupValidation(form);
    },
    submitHandler: function(form) {
        form = $(form);

        if (! handleCoveragesGroupValidation(form)) {
            return false;
        }

        form.find('button[type=submit]').prop('disabled', true);
        form.find('button[type=submit]').html('Updating carrier...');

        axios({
            method: 'POST',
            url: `/carrier/${currentCarrier}`,
            data: form.serialize(),
        }).then(function () {
            let toast = $(`<div id="toast-simple" class="z-[100] fixed top-[5%] right-5 flex items-center w-full max-w-xs p-4 space-x-4 rtl:space-x-reverse text-gray-500 bg-white divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg shadow-md dark:text-gray-400 dark:divide-gray-700 dark:bg-gray-800" role="alert">
                <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                    </svg>
                    <span class="sr-only">Check icon</span>
                </div>
                <div class="ps-4 text-sm font-normal">Carrier updated</div>
            </div>`);

            toast.prependTo($('body'));

            const options = {
                transition: 'transition-opacity',
                duration: 1000,
                timing: 'ease-out',
                onHide: () => {
                    toast.remove();
                }
            };

            // instance options object
            const instanceOptions = {
                id: toast.prop('id'),
                override: true
            };

            let dismiss = new Dismiss(toast.get(0), null, options, instanceOptions);

            window.setTimeout(function() {
                dismiss.hide()
            }, 3000);
        }).finally(function() {
            form.find('button[type=submit]').html('Update carrier');
            form.find('button[type=submit]').prop('disabled', false);
        });

        return false;
    }
});

$('#topbar-search').on('keyup', function() {
    let input = $(this);
    let searchDropdown = $('#search-dropdown');

    if (input.val().length === 0) {
        searchDropdown.addClass('hidden');
        searchDropdown.find('ul').html('');

        return;
    }

    let filteredCarriers = allCarriers.filter(function (carrier) {
        return carrier.name.toLowerCase().includes(input.val().toLowerCase());
    });


    searchDropdown.find('ul').html('');
    searchDropdown.removeClass('hidden');

    if (filteredCarriers.length === 0) {
        $(`<li><a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">No Results</a></li>`)
            .appendTo(searchDropdown.find('ul'));

        return;
    }

    filteredCarriers.forEach(function (_carrier) {
        $(`<li><a href="#" onclick="loadCarrier(${_carrier.id}); return false;" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">${_carrier.name}</a></li>`)
            .appendTo(searchDropdown.find('ul'));
    });
});
