<?php

namespace Database\Seeders;

use App\Models\Carriers;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class States extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $states = [];

        if (($handle = fopen("database/seeders/states.csv", "r")) !== false) {
            while (($data = fgetcsv($handle, 1000, ",")) !== false) {
                $states[] = [
                    'state'        => $data[0],
                    'abbreviation' => $data[1],
                    'country'      => 'US',
                    'created_at'   => Carbon::now(),
                    'updated_at'   => Carbon::now(),
                ];
            }
            fclose($handle);
        }

        DB::table('states')->insert($states);
    }
}
