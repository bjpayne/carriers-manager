import './bootstrap';
import 'flowbite';
import {statesData} from './statesData.js';
import $ from 'jquery';
window.$ = $;
import validate from 'jquery-validation';
// import mask from 'jquery-mask-plugin';

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
                    popupAnchor:  [10, -3]
                }
            });

            let marker = new markerIcon({iconUrl: 'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png'});

            let popup = `
                <p><strong>Carrier:</strong> ${carrier.name}</p>
                <p><strong>Address:</strong> ${carrier.address_1} ${carrier.address_2} ${carrier.city} ${carrier.state}, ${carrier.zip}</p>
                <p><strong>Phone:</strong> <a href="tel:${carrier.phone}">${carrier.phone}</a></p>
                <p><strong>Coverages</strong> ${carrier.carrier_coverages.map((_coverage) => { return _coverage.coverage}).join(', ')}</p>
            `;

            L.marker([carrier.long, carrier.lat], {icon: marker}).addTo(map).bindPopup(popup);
        });

        // let coverages = response.data;
        //
        // let map = L.map('map').setView([37.8, -96], 5);
        //
        // let tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //     maxZoom: 19,
        //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        // });
        //
        // tiles.addTo(map);
        //
        // function mapCoverageStyle(feature) {
        //     console.log(coverages[feature.properties.name]);
        //
        //     let fillColor = '#949494';
        //     let fillOpacity = 0.5;
        //
        //     if (coverages.hasOwnProperty(feature.properties.name)) {
        //         switch (coverages[feature.properties.name]) {
        //             case 'all':
        //                 fillColor = '#329F5B';
        //                 fillOpacity = 0.5;
        //
        //                 break;
        //             case 'partial':
        //                 fillColor = '#ffea1f';
        //                 fillOpacity = 0.5;
        //
        //                 break;
        //             case 'none':
        //             default:
        //                 break;
        //         }
        //     }
        //
        //     return {
        //         fillColor: fillColor,
        //         fillOpacity: fillOpacity,
        //         stroke: false,
        //     }
        // }
        //
        // let mapObject = L.geoJson(
        //     statesData,
        //     {
        //         style: mapCoverageStyle
        //     }
        // );
        //
        // mapObject.addTo(map);
});

$.validator.messages.required = 'required';

// $('#phone').mask('000-000-0000', {placeholder: '___-___-____'});

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
