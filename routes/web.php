<?php

use App\Models\CarrierCoverages;
use App\Models\Carriers;
use App\Models\States;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    $states = States::all();

    return view('home', compact('states'));
})->name('home');

Route::get('/carriers', function () {
    $carriers = Carriers::whereNotNull('lat')
        ->whereNotNull('long')
        ->with('carrierCoverages')
        ->get();

    return response()
        ->json($carriers);
});

Route::get('/carrier/{id}', function (string $id) {
    $carrier = Carriers::find($id);

    return response()
        ->json($carrier);
})->where('id', '[0-9]+');

Route::get('/geocode', function (Request $request) {
    $results = app("geocoder")
        ->using('mapbox')
        ->doNotCache()
        ->geocode($request->get('address'))
        ->get();

    $coordinates = [];

    if (! $results->isEmpty()) {
        // Geocoder\Model\Coordinates::toArray [long, lat]
        $coordinates = $results->get(0)->getCoordinates()->toArray();
    }

    return response()->json($coordinates);
});

Route::post('/carrier', function (Request $request) {
    $carrier = new Carriers();

    $carrier->name      = $request->input('name');
    $carrier->dba       = $request->input('dba');
    $carrier->address_1 = $request->input('address_1');
    $carrier->address_2 = $request->input('address_2', '');
    $carrier->city      = $request->input('city');
    $carrier->state     = $request->input('state');
    $carrier->zip       = $request->input('zip');
    $carrier->phone     = $request->input('phone');
    $carrier->notes     = $request->input('notes');
    $carrier->active    = $request->input('active', 1);

    $address = implode(' ', [$request->input('address_1'), $request->input('address_2'), $request->input('city'), $request->input('state'), $request->input('zip')]);

    $results = app("geocoder")
        ->using('mapbox')
        ->doNotCache()
        ->geocode($address)
        ->get();

    if (! $results->isEmpty()) {
        // Geocoder\Model\Coordinates::toArray [lat, long]
        $coordinates = $results->get(0)->getCoordinates()->toArray();

        $carrier->lat = $coordinates[0];
        $carrier->long = $coordinates[1];
    }

    $saved = $carrier->save();

    if ($saved) {
        foreach ($request->input('coverages') as $coverage => $_) {
            $carrierCoverage = new CarrierCoverages();

            $carrierCoverage->carrier_id = $carrier->id;
            $carrierCoverage->coverage = ucfirst(strtolower($coverage));

            $carrierCoverage->save();
        }
    }

    return response()
        ->redirectToRoute('home');
});
