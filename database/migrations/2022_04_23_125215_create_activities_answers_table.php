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
        Schema::create('activities_answers', function (Blueprint $table) {
            $table->id();
            $table->json('answers');
            $table->integer('score')->default(0);
            $table->bigInteger('activity_id');
            $table->foreign('activity_id')
                ->references('id')
                ->on('classes_activities')
                ->onDelete('cascade');
            $table->bigInteger('student_id');
            $table->foreign('student_id')
                ->references('id')
                ->on('users')
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
        Schema::dropIfExists('activities_answers');
    }
};
