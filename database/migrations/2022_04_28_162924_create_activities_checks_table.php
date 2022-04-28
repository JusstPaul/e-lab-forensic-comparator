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
        Schema::create('activities_checks', function (Blueprint $table) {
            $table->id();
            $table->integer('score')->default(0);
            $table->json('checks');
            $table->bigInteger('answer_id');
            $table->foreign('answer_id')
                ->references('id')
                ->on('activities_answers')
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
        Schema::dropIfExists('activities_checks');
    }
};
