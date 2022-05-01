<?php

use Illuminate\Database\Migrations\Migration;
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
        Schema::table('users', function ($table) {
            $table->bigInteger('joined_classes')->nullable();
            $table->foreign('joined_classes')
                ->references('id')
                ->on('classes')
                ->nullOnDelete();
        });

        Schema::table('classes', function ($table) {
            $table->bigInteger('instructor_id');
            $table->foreign('instructor_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
};
