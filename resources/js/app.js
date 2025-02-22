import './bootstrap';
import 'flowbite';
import {statesData} from './statesData.js';

axios.get('/carriers', )
    .then(function (response) {
        let coverages = response.data;

        let map = L.map('map').setView([37.8, -96], 5);

        let tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });

        tiles.addTo(map);

        function mapCoverageStyle(feature) {
            console.log(coverages[feature.properties.name]);

            let fillColor = '#949494';
            let fillOpacity = 0.5;

            if (coverages.hasOwnProperty(feature.properties.name)) {
                switch (coverages[feature.properties.name]) {
                    case 'all':
                        fillColor = '#329F5B';
                        fillOpacity = 0.5;

                        break;
                    case 'partial':
                        fillColor = '#ffea1f';
                        fillOpacity = 0.5;

                        break;
                    case 'none':
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
