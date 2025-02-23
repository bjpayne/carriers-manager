<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Carriers extends Model
{
    /** @use HasFactory<\Database\Factories\CarriersFactory> */
    use HasFactory;

    protected $with = ['carrierCoverages', 'carrierNotes'];

    public function carrierCoverages() : HasMany
    {
        return $this->hasMany(CarrierCoverages::class, 'carrier_id', 'id');
    }

    public function carrierNotes() : HasMany
    {
        return $this->hasMany(CarrierNotes::class, 'carrier_id', 'id');
    }

    public function coverage()
    {
        switch ($this->carrierCoverages->count()) {
            case 3:
                return 'all';
            case 0:
                return 'none';
            default:
                return 'partial';
        }
    }
}
