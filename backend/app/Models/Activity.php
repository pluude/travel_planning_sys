<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'trip_day_id',
        'name',
        'type',
        'cost',
        'notes',
        'start_time',
    ];

    public function tripDay()
    {
        return $this->belongsTo(TripDay::class);
    }
}