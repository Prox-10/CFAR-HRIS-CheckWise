<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Evaluation;
use App\Models\Employee;

class EvaluationController extends Controller
{
  public function index(Request $request)
  {
    $evaluations = Employee::with('evaluations')->orderBy('created_at', 'desc')->get();

    $transformedEvaluations = $evaluations->transform(
      function ($evaluation) {
        return
          [
            'id' => $evaluation->id,
            'employee_name' => $evaluation->employee_name,
            'ratings' => $evaluation->ratings,
            'rating_date' => $evaluation->rating_date,
            'work_quality' => $evaluation->work_quality,
            'safety_compliance' => $evaluation->safety_compliance,
            'punctuality' => $evaluation->punctuality,
            'teamwork' => $evaluation->teamwork,
            'organization' => $evaluation->organization,
            'equipment_handling' => $evaluation->equipment_handling,
            'comment' => $evaluation->comment,
            'created_at' => $evaluation->created_at->format('d M Y'),
            'updated_at' => $evaluation->updated_at->format('d M Y'),
          ];
      }
    );

    return response()->json($transformedEvaluations);
  }
}
