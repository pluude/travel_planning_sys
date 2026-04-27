<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttractionSeeder extends Seeder
{
    public function run(): void
    {
        $destinations = DB::table('destinations')->get()->keyBy('name');

        $attractions = [
            // Paris
            ['destination' => 'Paris', 'name' => 'Eiffel Tower', 'type' => 'landmark', 'price_estimate' => 26, 'description' => 'Iconic iron tower with stunning city views.'],
            ['destination' => 'Paris', 'name' => 'Louvre Museum', 'type' => 'museum', 'price_estimate' => 17, 'description' => 'World\'s largest art museum, home to the Mona Lisa.'],
            ['destination' => 'Paris', 'name' => 'Seine River Cruise', 'type' => 'romantic', 'price_estimate' => 15, 'description' => 'Romantic boat cruise along the Seine river.'],
            ['destination' => 'Paris', 'name' => 'Montmartre Walk', 'type' => 'walk', 'price_estimate' => 0, 'description' => 'Charming hilltop neighbourhood with artists and cafés.'],
            ['destination' => 'Paris', 'name' => 'Palace of Versailles', 'type' => 'landmark', 'price_estimate' => 20, 'description' => 'Magnificent royal palace and gardens.'],

            // Bali
            ['destination' => 'Bali', 'name' => 'Tanah Lot Temple', 'type' => 'landmark', 'price_estimate' => 5, 'description' => 'Iconic sea temple perched on a rock.'],
            ['destination' => 'Bali', 'name' => 'Ubud Monkey Forest', 'type' => 'nature', 'price_estimate' => 5, 'description' => 'Sacred forest sanctuary with playful monkeys.'],
            ['destination' => 'Bali', 'name' => 'Kuta Beach', 'type' => 'beach', 'price_estimate' => 0, 'description' => 'Famous beach perfect for surfing and sunsets.'],
            ['destination' => 'Bali', 'name' => 'Tegallalang Rice Terraces', 'type' => 'nature', 'price_estimate' => 3, 'description' => 'Stunning UNESCO rice terrace landscapes.'],
            ['destination' => 'Bali', 'name' => 'Balinese Cooking Class', 'type' => 'experience', 'price_estimate' => 35, 'description' => 'Learn to cook traditional Balinese dishes.'],

            // Reykjavik
            ['destination' => 'Reykjavik', 'name' => 'Northern Lights Tour', 'type' => 'nature', 'price_estimate' => 80, 'description' => 'Hunt for the magical aurora borealis.'],
            ['destination' => 'Reykjavik', 'name' => 'Blue Lagoon', 'type' => 'relaxation', 'price_estimate' => 60, 'description' => 'Famous geothermal spa in a lava field.'],
            ['destination' => 'Reykjavik', 'name' => 'Hallgrímskirkja Church', 'type' => 'landmark', 'price_estimate' => 5, 'description' => 'Iconic church with panoramic city views.'],
            ['destination' => 'Reykjavik', 'name' => 'Golden Circle Tour', 'type' => 'adventure', 'price_estimate' => 70, 'description' => 'Geysers, waterfalls and national parks.'],
            ['destination' => 'Reykjavik', 'name' => 'Whale Watching', 'type' => 'nature', 'price_estimate' => 90, 'description' => 'Spot humpback and minke whales in the bay.'],

            // Rome
            ['destination' => 'Rome', 'name' => 'Colosseum', 'type' => 'landmark', 'price_estimate' => 18, 'description' => 'Ancient amphitheatre and symbol of Rome.'],
            ['destination' => 'Rome', 'name' => 'Vatican Museums', 'type' => 'museum', 'price_estimate' => 20, 'description' => 'World-class museums including the Sistine Chapel.'],
            ['destination' => 'Rome', 'name' => 'Trevi Fountain', 'type' => 'landmark', 'price_estimate' => 0, 'description' => 'Iconic baroque fountain — throw a coin!'],
            ['destination' => 'Rome', 'name' => 'Roman Forum Walk', 'type' => 'walk', 'price_estimate' => 12, 'description' => 'Walk through the heart of ancient Rome.'],
            ['destination' => 'Rome', 'name' => 'Pasta Making Class', 'type' => 'experience', 'price_estimate' => 45, 'description' => 'Learn to make fresh pasta from a local chef.'],

            // Maldives
            ['destination' => 'Maldives', 'name' => 'Snorkeling Tour', 'type' => 'beach', 'price_estimate' => 40, 'description' => 'Explore vibrant coral reefs and tropical fish.'],
            ['destination' => 'Maldives', 'name' => 'Sunset Dolphin Cruise', 'type' => 'romantic', 'price_estimate' => 50, 'description' => 'Sail at sunset and spot playful dolphins.'],
            ['destination' => 'Maldives', 'name' => 'Overwater Bungalow Stay', 'type' => 'relaxation', 'price_estimate' => 300, 'description' => 'Stay in a luxury overwater villa.'],
            ['destination' => 'Maldives', 'name' => 'Scuba Diving', 'type' => 'adventure', 'price_estimate' => 80, 'description' => 'Dive into crystal clear waters with manta rays.'],
            ['destination' => 'Maldives', 'name' => 'Local Island Visit', 'type' => 'experience', 'price_estimate' => 20, 'description' => 'Visit a traditional Maldivian fishing village.'],

            // Prague
            ['destination' => 'Prague', 'name' => 'Prague Castle', 'type' => 'landmark', 'price_estimate' => 15, 'description' => 'Largest ancient castle complex in the world.'],
            ['destination' => 'Prague', 'name' => 'Charles Bridge Walk', 'type' => 'walk', 'price_estimate' => 0, 'description' => 'Iconic medieval bridge with baroque statues.'],
            ['destination' => 'Prague', 'name' => 'Old Town Square', 'type' => 'landmark', 'price_estimate' => 0, 'description' => 'Historic square with astronomical clock.'],
            ['destination' => 'Prague', 'name' => 'Czech Beer Tasting', 'type' => 'experience', 'price_estimate' => 25, 'description' => 'Sample world-famous Czech beers in a local pub.'],
            ['destination' => 'Prague', 'name' => 'Boat Cruise on Vltava', 'type' => 'romantic', 'price_estimate' => 20, 'description' => 'Romantic cruise along the Vltava river.'],

            // Tokyo
            ['destination' => 'Tokyo', 'name' => 'Senso-ji Temple', 'type' => 'landmark', 'price_estimate' => 0, 'description' => 'Tokyo\'s oldest and most famous Buddhist temple.'],
            ['destination' => 'Tokyo', 'name' => 'Shibuya Crossing', 'type' => 'landmark', 'price_estimate' => 0, 'description' => 'World\'s busiest pedestrian crossing.'],
            ['destination' => 'Tokyo', 'name' => 'Tsukiji Fish Market', 'type' => 'experience', 'price_estimate' => 10, 'description' => 'Famous market with fresh sushi and seafood.'],
            ['destination' => 'Tokyo', 'name' => 'Mount Fuji Day Trip', 'type' => 'adventure', 'price_estimate' => 60, 'description' => 'Visit Japan\'s iconic snow-capped volcano.'],
            ['destination' => 'Tokyo', 'name' => 'Harajuku Street Walk', 'type' => 'walk', 'price_estimate' => 0, 'description' => 'Explore Tokyo\'s quirky fashion district.'],

            // Santorini
            ['destination' => 'Santorini', 'name' => 'Oia Sunset View', 'type' => 'romantic', 'price_estimate' => 0, 'description' => 'World\'s most famous sunset from Oia village.'],
            ['destination' => 'Santorini', 'name' => 'Caldera Boat Tour', 'type' => 'adventure', 'price_estimate' => 35, 'description' => 'Sail around the volcanic caldera.'],
            ['destination' => 'Santorini', 'name' => 'Red Beach Visit', 'type' => 'beach', 'price_estimate' => 0, 'description' => 'Unique red volcanic sand beach.'],
            ['destination' => 'Santorini', 'name' => 'Wine Tasting Tour', 'type' => 'experience', 'price_estimate' => 40, 'description' => 'Sample local Assyrtiko wines at a vineyard.'],
            ['destination' => 'Santorini', 'name' => 'Akrotiri Archaeological Site', 'type' => 'museum', 'price_estimate' => 12, 'description' => 'Ancient Minoan city preserved in volcanic ash.'],

            // Swiss Alps
            ['destination' => 'Swiss Alps', 'name' => 'Jungfraujoch Train Ride', 'type' => 'adventure', 'price_estimate' => 120, 'description' => 'Train to the "Top of Europe" at 3454m.'],
            ['destination' => 'Swiss Alps', 'name' => 'Ski in Zermatt', 'type' => 'adventure', 'price_estimate' => 80, 'description' => 'World-class skiing near the Matterhorn.'],
            ['destination' => 'Swiss Alps', 'name' => 'Lake Geneva Cruise', 'type' => 'romantic', 'price_estimate' => 30, 'description' => 'Scenic cruise on Europe\'s largest alpine lake.'],
            ['destination' => 'Swiss Alps', 'name' => 'Hiking in Grindelwald', 'type' => 'nature', 'price_estimate' => 0, 'description' => 'Stunning alpine trails with glacier views.'],
            ['destination' => 'Swiss Alps', 'name' => 'Swiss Chocolate Workshop', 'type' => 'experience', 'price_estimate' => 35, 'description' => 'Make your own Swiss chocolate with a master chocolatier.'],

            // Barcelona
            ['destination' => 'Barcelona', 'name' => 'Sagrada Família', 'type' => 'landmark', 'price_estimate' => 26, 'description' => 'Gaudí\'s breathtaking unfinished basilica.'],
            ['destination' => 'Barcelona', 'name' => 'Park Güell', 'type' => 'landmark', 'price_estimate' => 10, 'description' => 'Colourful mosaic park designed by Gaudí.'],
            ['destination' => 'Barcelona', 'name' => 'La Boqueria Market', 'type' => 'experience', 'price_estimate' => 0, 'description' => 'Famous food market on Las Ramblas.'],
            ['destination' => 'Barcelona', 'name' => 'Barceloneta Beach', 'type' => 'beach', 'price_estimate' => 0, 'description' => 'Popular city beach with beach bars.'],
            ['destination' => 'Barcelona', 'name' => 'Flamenco Show', 'type' => 'experience', 'price_estimate' => 30, 'description' => 'Passionate Spanish dance performance.'],

            // Vienna
            ['destination' => 'Vienna', 'name' => 'Schönbrunn Palace', 'type' => 'landmark', 'price_estimate' => 20, 'description' => 'Magnificent imperial palace with 1441 rooms.'],
            ['destination' => 'Vienna', 'name' => 'Vienna Opera House', 'type' => 'experience', 'price_estimate' => 50, 'description' => 'One of the world\'s leading opera venues.'],
            ['destination' => 'Vienna', 'name' => 'Kunsthistorisches Museum', 'type' => 'museum', 'price_estimate' => 18, 'description' => 'World-class art museum in a stunning building.'],
            ['destination' => 'Vienna', 'name' => 'Prater & Giant Ferris Wheel', 'type' => 'landmark', 'price_estimate' => 10, 'description' => 'Historic amusement park with iconic ferris wheel.'],
            ['destination' => 'Vienna', 'name' => 'Viennese Coffee House Tour', 'type' => 'experience', 'price_estimate' => 15, 'description' => 'Visit legendary coffeehouses and taste Sachertorte.'],

            // Phuket
            ['destination' => 'Phuket', 'name' => 'Phi Phi Islands Tour', 'type' => 'beach', 'price_estimate' => 40, 'description' => 'Stunning islands with crystal clear waters.'],
            ['destination' => 'Phuket', 'name' => 'Big Buddha', 'type' => 'landmark', 'price_estimate' => 0, 'description' => '45-metre white marble Buddha with panoramic views.'],
            ['destination' => 'Phuket', 'name' => 'Old Phuket Town Walk', 'type' => 'walk', 'price_estimate' => 0, 'description' => 'Charming Sino-Portuguese architecture and street art.'],
            ['destination' => 'Phuket', 'name' => 'Thai Cooking Class', 'type' => 'experience', 'price_estimate' => 35, 'description' => 'Learn to cook authentic Thai dishes.'],
            ['destination' => 'Phuket', 'name' => 'Elephant Sanctuary Visit', 'type' => 'nature', 'price_estimate' => 60, 'description' => 'Ethical elephant sanctuary in the jungle.'],
        ];

        $sameAllWeek = fn (string $h) => [
            'mon' => $h, 'tue' => $h, 'wed' => $h, 'thu' => $h, 'fri' => $h, 'sat' => $h, 'sun' => $h,
        ];

        // Realistic opening hours by attraction type. Every type has real hours.
        $hoursByType = [
            'museum' => [
                'mon' => 'closed',
                'tue' => '09:00-17:00', 'wed' => '09:00-17:00', 'thu' => '09:00-17:00', 'fri' => '09:00-17:00',
                'sat' => '10:00-18:00', 'sun' => '10:00-18:00',
            ],
            'landmark' => [
                'mon' => '09:00-18:00', 'tue' => '09:00-18:00', 'wed' => '09:00-18:00',
                'thu' => '09:00-18:00', 'fri' => '09:00-18:00',
                'sat' => '09:00-19:00', 'sun' => '09:00-19:00',
            ],
            'experience' => [
                'mon' => '10:00-14:00', 'tue' => '10:00-14:00', 'wed' => '10:00-14:00',
                'thu' => '10:00-14:00', 'fri' => '10:00-14:00',
                'sat' => '10:00-14:00', 'sun' => 'closed',
            ],
            'relaxation' => $sameAllWeek('10:00-22:00'),
            'romantic' => [
                'mon' => '18:00-21:00', 'tue' => '18:00-21:00', 'wed' => '18:00-21:00',
                'thu' => '18:00-21:00', 'fri' => '18:00-22:00',
                'sat' => '18:00-22:00', 'sun' => '18:00-21:00',
            ],
            'adventure' => $sameAllWeek('08:00-17:00'),
            'beach' => $sameAllWeek('06:00-20:00'),
            'walk' => $sameAllWeek('07:00-22:00'),
            'nature' => $sameAllWeek('06:00-20:00'),
        ];

        // Typical visit duration (minutes) by type.
        $durationByType = [
            'museum' => 180,
            'landmark' => 90,
            'experience' => 150,
            'relaxation' => 180,
            'romantic' => 120,
            'adventure' => 240,
            'beach' => 180,
            'walk' => 90,
            'nature' => 180,
        ];

        foreach ($attractions as $attraction) {
            if (isset($destinations[$attraction['destination']])) {
                $hours = $hoursByType[$attraction['type']] ?? $sameAllWeek('09:00-18:00');
                $duration = $durationByType[$attraction['type']] ?? 120;

                DB::table('attractions')->insert([
                    'destination_id' => $destinations[$attraction['destination']]->id,
                    'name' => $attraction['name'],
                    'type' => $attraction['type'],
                    'price_estimate' => $attraction['price_estimate'],
                    'description' => $attraction['description'],
                    'opening_hours' => json_encode($hours),
                    'duration_minutes' => $duration,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}