<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('classes_activities', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type');
            $table->date('date_end');
            $table->time('time_end');
            $table->json('questions');
            $table->bigInteger('classes_id');
            $table->foreign('classes_id')
                ->references('id')
                ->on('classes')
                ->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('classes_activities');
    }
};
