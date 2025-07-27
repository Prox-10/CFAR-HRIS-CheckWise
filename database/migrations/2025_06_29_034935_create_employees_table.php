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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('employeeid', 100)->unique();
            $table->string('employee_name', 100);
            $table->string('firstname', 100);
            $table->string('middlename', 100)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('lastname', 100);
            $table->string('department', 100);
            $table->string('position', 100);
            $table->string('gender', 100)->nullable();
            $table->string('phone', 100)->nullable();
            $table->string('work_status', 100)->nullable();
            $table->string('status', 100)->nullable();
            $table->date('service_tenure');
            $table->string('picture')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
