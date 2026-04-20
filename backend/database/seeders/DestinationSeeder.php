<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Destination;

class DestinationSeeder extends Seeder
{
    public function run(): void
    {
        $destinations = [
            [
                'name' => 'Paris',
                'country' => 'France',
                'description' => 'Ideal for romantic trips, museums, and city walks.',
                'trip_type' => 'romantic',
                'season' => 'spring',
                'budget_level' => 'high',
                'duration_range' => '3-5 days',
                'image_url' => 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bali',
                'country' => 'Indonesia',
                'description' => 'Great for relaxation, beaches, and tropical scenery.',
                'trip_type' => 'relaxation',
                'season' => 'summer',
                'budget_level' => 'medium',
                'duration_range' => '1 week',
                'image_url' => 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Reykjavik',
                'country' => 'Iceland',
                'description' => 'Perfect for adventure, nature, and winter landscapes.',
                'trip_type' => 'adventure',
                'season' => 'winter',
                'budget_level' => 'high',
                'duration_range' => '5-7 days',
                'image_url' => 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1200&auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rome',
                'country' => 'Italy',
                'description' => 'Excellent for cultural sightseeing and food experiences.',
                'trip_type' => 'sightseeing',
                'season' => 'spring',
                'budget_level' => 'medium',
                'duration_range' => '3-5 days',
                'image_url' => 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Maldives',
                'country' => 'Maldives',
                'description' => 'Luxury beaches, resorts, and peaceful relaxation.',
                'trip_type' => 'relaxation',
                'season' => 'winter',
                'budget_level' => 'high',
                'duration_range' => '1 week',
                'image_url' => 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Prague',
                'country' => 'Czech Republic',
                'description' => 'Historic city with affordable sightseeing and romantic atmosphere.',
                'trip_type' => 'romantic',
                'season' => 'autumn',
                'budget_level' => 'low',
                'duration_range' => '3-5 days',
                'image_url' => 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Tokyo',
                'country' => 'Japan',
                'description' => 'A mix of modern attractions, food, culture, and city exploration.',
                'trip_type' => 'sightseeing',
                'season' => 'autumn',
                'budget_level' => 'high',
                'duration_range' => '1 week',
                'image_url' => 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Santorini',
                'country' => 'Greece',
                'description' => 'Famous for sunsets, views, and romantic seaside vacations.',
                'trip_type' => 'romantic',
                'season' => 'summer',
                'budget_level' => 'medium',
                'duration_range' => '3-5 days',
                'image_url' => 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Swiss Alps',
                'country' => 'Switzerland',
                'description' => 'Mountain adventure, skiing, and scenic hiking.',
                'trip_type' => 'adventure',
                'season' => 'winter',
                'budget_level' => 'high',
                'duration_range' => '1 week',
                'image_url' => 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Barcelona',
                'country' => 'Spain',
                'description' => 'Beaches, architecture, nightlife, and city exploration.',
                'trip_type' => 'sightseeing',
                'season' => 'summer',
                'budget_level' => 'medium',
                'duration_range' => '3-5 days',
                'image_url' => 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Vienna',
                'country' => 'Austria',
                'description' => 'Elegant city for culture, music, and calm urban travel.',
                'trip_type' => 'sightseeing',
                'season' => 'winter',
                'budget_level' => 'medium',
                'duration_range' => '3-5 days',
                'image_url' => 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Phuket',
                'country' => 'Thailand',
                'description' => 'Budget-friendly beach destination for relaxation and island trips.',
                'trip_type' => 'relaxation',
                'season' => 'summer',
                'budget_level' => 'low',
                'duration_range' => '1 week',
                'image_url' => 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&auto=format&fit=crop&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($destinations as $data) {
            Destination::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
        }
    }
}
