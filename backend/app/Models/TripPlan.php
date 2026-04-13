<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TripPlan extends Model
{
    protected $fillable = [
        'user_id',
        'destination_id',
        'title',
        'start_date',
        'end_date',
        'budget_limit',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }

    public function tripDays()
    {
        return $this->hasMany(TripDay::class);
    }
}