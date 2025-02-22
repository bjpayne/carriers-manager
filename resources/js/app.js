import './bootstrap';
import 'flowbite';
import {statesData} from './statesData.js';
import $ from 'jquery';
window.$ = $;
import validate from 'jquery-validation';
import mask from 'jquery-mask-plugin';
import _ from 'lodash';

let currentCarrier = (function () {
    let pathName = window.location.pathname;

    let regexp = /(\/carrier\/)([0-9]*)/gm;
    let groups = [...pathName.matchAll(regexp)];

    if (groups.length === 2) {
        return groups[1];
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

            if (currentCarrier && currentCarrier === carrier.id) {
                mapMarker.openPopup(popup);
            }

            mapMarker.addTo(map);
        });

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

console.log(currentCarrier);

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

        return handleCoveragesGroupValidation(form);
    }
});
