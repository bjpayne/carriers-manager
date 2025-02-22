<?php

namespace Database\Factories;

use App\Models\Carriers;
use Geocoder\Laravel\ProviderAndDumperAggregator;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Collection;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Carriers>
 */
class CarriersFactory extends Factory
{
    /** @var ProviderAndDumperAggregator|null */
    private $geoCoder;

    public function __construct(
        $count = null,
        ?Collection $states = null,
        ?Collection $has = null,
        ?Collection $for = null,
        ?Collection $afterMaking = null,
        ?Collection $afterCreating = null,
        $connection = null,
        ?Collection $recycle = null,
        bool $expandRelationships = true
    )
    {
        $this->geoCoder = app("geocoder")
            ->using('mapbox');

        parent::__construct($count, $states, $has, $for, $afterMaking, $afterCreating, $connection, $recycle, $expandRelationships);
    }

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $model = [
            'name' => $this->faker->company(),
            'dba' => $this->faker->company(),
            'address_1' => $this->faker->streetAddress(),
            'address_2' => $this->faker->secondaryAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->stateAbbr(),
            'zip' => $this->faker->postcode(),
            'phone' =>  $this->faker->regexify('[0-9]{3}-[0-9]{3}-[0-9]{4}'),
        ];

        $coordinates = $this->geoCoder
            ->doNotCache()
            ->geocode(implode(' ', [$model['address_1'], $model['address_2'], $model['city'], $model['state'], $model['zip']]))
            ->get();

        $latLong = [null, null];

        if (! $coordinates->isEmpty()) {
            // Geocoder\Model\Coordinates::toArray [long, lat]
            $latLong = $coordinates->get(0)->getCoordinates()->toArray();
        }

        $model['lat'] = $latLong[0];
        $model['long'] = $latLong[1];

        return $model;
    }
}
