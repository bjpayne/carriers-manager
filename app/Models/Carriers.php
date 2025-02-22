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

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('active', function (Builder $builder) {
            $builder->where('active', '=', 1);
        });
    }

    public function carrierCoverages() : HasMany
    {
        return $this->hasMany(CarrierCoverages::class, 'carrier_id', 'id');
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
