<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attractions', function (Blueprint $table) {
            $table->unsignedSmallInteger('duration_minutes')->nullable()->after('opening_hours');
        });

        Schema::table('activities', function (Blueprint $table) {
            $table->time('end_time')->nullable()->after('start_time');
        });
    }

    public function down(): void
    {
        Schema::table('attractions', function (Blueprint $table) {
            $table->dropColumn('duration_minutes');
        });

        Schema::table('activities', function (Blueprint $table) {
            $table->dropColumn('end_time');
        });
    }
};
