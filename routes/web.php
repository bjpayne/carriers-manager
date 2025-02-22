<?php

use App\Models\Carriers;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('home');
});

Route::get('/carriers', function () {
    $carriers = Carriers::all();

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
   dd($request->all());
});
