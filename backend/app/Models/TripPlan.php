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
        'flight_cost',
        'hotel_cost',
        'status',
    ];

    protected $appends = ['activities_cost', 'total_spent', 'budget_remaining'];

    public function getActivitiesCostAttribute()
    {
        $days = $this->relationLoaded('tripDays') ? $this->tripDays : $this->tripDays()->with('activities')->get();

        return (float) $days->sum(fn ($day) =>
            ($day->relationLoaded('activities') ? $day->activities : $day->activities()->get())->sum('cost')
        );
    }

    public function getTotalSpentAttribute()
    {
        return round((float) $this->flight_cost + (float) $this->hotel_cost + $this->activities_cost, 2);
    }

    public function getBudgetRemainingAttribute()
    {
        if ($this->budget_limit === null) return null;
        return round((float) $this->budget_limit - $this->total_spent, 2);
    }

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