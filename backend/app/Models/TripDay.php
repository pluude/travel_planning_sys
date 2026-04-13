<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TripDay extends Model
{
    protected $fillable = [
        'trip_plan_id',
        'date',
        'day_number',
    ];

    public function tripPlan()
    {
        return $this->belongsTo(TripPlan::class);
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }
}