<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('carriers', function (Blueprint $table) {
            $table->id();
            $table->string('name')
                ->nullable(false);
            $table->string('dba')
                ->nullable();
            $table->string('address_1')
                ->nullable(false);
            $table->string('address_2')
                ->nullable();
            $table->string('city')
                ->nullable(false);
            $table->string('state')
                ->nullable(false);
            $table->string('zip')
                ->nullable(false);
            $table->string('phone')
                ->nullable(false);
            $table->longText('notes')
                ->nullable();
            $table->string('lat')
                ->nullable();
            $table->string('long')
                ->nullable();
            $table->string('active')
                ->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carriers');
    }
};
