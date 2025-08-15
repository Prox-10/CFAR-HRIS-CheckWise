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
    // If evaluations table doesn't exist yet (on fresh), skip safely
    if (!Schema::hasTable('evaluations')) {
      return;
    }

    // Drop quarter if it exists
    if (Schema::hasColumn('evaluations', 'quarter')) {
      Schema::table('evaluations', function (Blueprint $table) {
        $table->dropColumn('quarter');
      });
    }

    // Add period if it doesn't exist
    if (!Schema::hasColumn('evaluations', 'period')) {
      Schema::table('evaluations', function (Blueprint $table) {
        $table->unsignedTinyInteger('period')->nullable()->after('rating_date');
      });
    }

    // Ensure year exists (older installs may miss it)
    if (!Schema::hasColumn('evaluations', 'year')) {
      Schema::table('evaluations', function (Blueprint $table) {
        $table->unsignedSmallInteger('year')->nullable()->after('period');
      });
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    if (!Schema::hasTable('evaluations')) {
      return;
    }

    // Remove period if exists
    if (Schema::hasColumn('evaluations', 'period')) {
      Schema::table('evaluations', function (Blueprint $table) {
        $table->dropColumn('period');
      });
    }

    // Re-add quarter if missing
    if (!Schema::hasColumn('evaluations', 'quarter')) {
      Schema::table('evaluations', function (Blueprint $table) {
        $table->unsignedTinyInteger('quarter')->nullable()->after('rating_date');
      });
    }
  }
};
