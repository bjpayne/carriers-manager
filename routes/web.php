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

Route::post('/carrier', function (Request $request) {
    $carrier = new Carriers();

    $carrier->name      = $request->input('name');
    $carrier->dba       = $request->input('dba');
    $carrier->address_1 = $request->input('address_1');
    $carrier->address_2 = $request->input('address_2');
    $carrier->city      = $request->input('city');
    $carrier->state     = $request->input('state');
    $carrier->zip       = $request->input('zip');
    $carrier->phone     = $request->input('phone');
    $carrier->notes     = $request->input('notes');
    $carrier->active    = $request->input('active', 1);

    $address = implode(' ', array_filter([$request->input('address_1'), $request->input('address_2'), $request->input('city'), $request->input('state'), $request->input('zip')]));

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

Route::get('/carrier/{id}', function (string $id) {
    $states = States::all();

    $carrier = Carriers::with('carrierCoverages')->find($id);

    return view('home', compact('states', 'carrier'));
})->where('id', '[0-9]+');

Route::get('/coverages', function () {
    $states = States::all();

    $coverages = collect();

    $states->each(function ($state) use ($coverages) {
        if (! $coverages->has($state->state)) {
            $coverages->put($state->state, collect());
        }

        $carriers = Carriers::with('carrierCoverages')
            ->where('state', $state->abbreviation)
            ->whereNotNull('lat')
            ->whereNotNull('long')
            ->get();

        $carriers->each(function ($carrier) use ($state, $coverages) {
            $carrier->carrierCoverages()->each(function ($carrierCoverage) use ($state, $coverages) {
                /** @var \Illuminate\Support\Collection $coverage */
                $coverage = $coverages->get($state->state);

                if (! $coverage->contains($carrierCoverage->coverage)) {
                    $coverage->push($carrierCoverage->coverage);
                }
            });
        });
    });

    return response()
        ->json($coverages);
});

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
