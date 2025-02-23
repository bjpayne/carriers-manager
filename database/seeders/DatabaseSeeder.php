<?php

namespace Database\Seeders;

use App\Models\CarrierCoverages;
use App\Models\CarrierNotes;
use App\Models\Carriers;
use Database\Factories\CarrierNotesFactory;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
            // 'name' => 'Test User',
            // 'email' => 'test@example.com',
        // ]);

        Carriers::factory()
            ->has(
                CarrierCoverages::factory()
                    ->count(rand(1, 3))
                    ->sequence(['coverage' => 'Auto'], ['coverage' => 'Home'], ['coverage' => 'Life'])
            )
            ->has(
                CarrierNotes::factory()
                    ->count(rand(0, 3))
            )
            ->createMany(100);

        $this->call([
            States::class
        ]);
    }
}
