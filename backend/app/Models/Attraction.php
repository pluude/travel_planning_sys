<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attraction extends Model
{
    protected $fillable = [
        'destination_id',
        'name',
        'type',
        'price_estimate',
        'description',
        'opening_hours',
        'duration_minutes',
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'duration_minutes' => 'integer',
    ];
}
