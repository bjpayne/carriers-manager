<?php

namespace Database\Seeders;

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
                    'country'      => 'US'
                ];
            }
            fclose($handle);
        }

        DB::table('states')->insert($states);
    }
}
