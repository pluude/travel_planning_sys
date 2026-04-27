<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trip_plans', function (Blueprint $table) {
            $table->decimal('flight_cost', 10, 2)->default(0)->after('budget_limit');
            $table->decimal('hotel_cost', 10, 2)->default(0)->after('flight_cost');
        });
    }

    public function down(): void
    {
        Schema::table('trip_plans', function (Blueprint $table) {
            $table->dropColumn(['flight_cost', 'hotel_cost']);
        });
    }
};
