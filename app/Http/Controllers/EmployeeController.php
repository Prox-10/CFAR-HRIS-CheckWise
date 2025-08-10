<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\EmployeeRequest;
use Inertia\Inertia;
use App\Models\Employee;
use App\Models\Fingerprint;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $employees = Employee::with(['fingerprints', 'evaluations' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }])->orderBy('created_at', 'desc')->get();

        $transformedEmployees = $employees->transform(function ($employee) {
            $latestEval = $employee->evaluations->first();
            return [
                'id'            => $employee->id,
                'employee_name' => $employee->employee_name,
                'firstname'     => $employee->firstname,
                'middlename'    => $employee->middlename,
                'lastname'      => $employee->lastname,
                'employeeid'    => $employee->employeeid,
                'work_status'   => $employee->work_status,
                'service_tenure' => $employee->service_tenure,
                'department'    => $employee->department,
                'picture'       => $employee->picture,
                'date_of_birth' => $employee->date_of_birth,
                'gender'        => $employee->gender,
                'status'        => $employee->status,
                'phone'         => $employee->phone,
                'email'         => $employee->email,
                'position'      => $employee->position,
                'pin'           => $employee->pin,
                'created_at'    => $employee->created_at->format('d M Y'),
                'fingerprints'  => $employee->fingerprints->map(function ($fp) {
                    return [
                        'id' => $fp->id,
                        'employee_id' => $fp->employee_id,
                        'finger_name' => $fp->finger_name,
                        'fingerprint_template' => base64_encode($fp->fingerprint_template),
                        'fingerprint_image' => $fp->fingerprint_image ?: null, // return as-is, no base64_encode
                        'fingerprint_captured_at' => $fp->fingerprint_captured_at,
                        'created_at' => $fp->created_at,
                        'updated_at' => $fp->updated_at,
                    ];
                }),
                'latest_rating' => $latestEval ? $latestEval->ratings : null,
            ];
        });
        $totalEmployee = Employee::distinct('employeeid')->count('employeeid');
        $totalDepartment = Employee::distinct('department')->count();

        // Previous period (previous month)
        $prevMonthStart = now()->subMonth()->startOfMonth();
        $prevTotalEmployee = Employee::where('created_at', '<', now()->startOfMonth())->distinct('employeeid')->count('employeeid');
        $prevTotalDepartment = Employee::where('created_at', '<', now()->startOfMonth())->distinct('department')->count('department');

        return Inertia::render('employee/index', [
            'employee'        => $transformedEmployees,
            'totalEmployee'   => $totalEmployee,
            'prevTotalEmployee' => $prevTotalEmployee,
            'totalDepartment' => $totalDepartment,
            'prevTotalDepartment' => $prevTotalDepartment,
            'departments'     => [
                'Administration',
                'Finance & Accounting',
                'Human Resources',
                'Quality Control',
                'Production',
                'Field Operations',
                'Logistics & Distribution',
                'Research & Development',
                'Sales & Marketing',
                'Maintenance',
                'Engineering',
            ],
            'positions'       => [
                'Admin Assistant',
                'Accountant',
                'HR Officer',
                'Quality Inspector',
                'Production Supervisor',
                'Field Worker',
                'Field Supervisor',
                'Logistics Coordinator',
                'R&D Specialist',
                'Sales Executive',
                'Maintenance Technician',
                'P&D',
            ],
        ]);
    }

    /**
     * API: Return all employees with fingerprints as JSON
     */
    public function apiIndex(Request $request)
    {
        $employees = Employee::with('fingerprints')->orderBy('created_at', 'desc')->get();
        $transformedEmployees = $employees->transform(function ($employee) {
            return [
                'id'            => $employee->id,
                'employee_name' => $employee->employee_name,
                'firstname'     => $employee->firstname,
                'middlename'    => $employee->middlename,
                'lastname'      => $employee->lastname,
                'employeeid'    => $employee->employeeid,
                'work_status'   => $employee->work_status,
                'service_tenure' => $employee->service_tenure,
                'department'    => $employee->department,
                'picture'       => $employee->picture,
                'date_of_birth' => $employee->date_of_birth,
                'gender'        => $employee->gender,
                'status'        => $employee->status,
                'phone'         => $employee->phone,
                'email'         => $employee->email,
                'position'      => $employee->position,
                'created_at'    => $employee->created_at->format('d M Y'),
                'fingerprints'  => $employee->fingerprints->map(function ($fp) {
                    return [
                        'id' => $fp->id,
                        'employee_id' => $fp->employee_id,
                        'finger_name' => $fp->finger_name,
                        'fingerprint_template' => base64_encode($fp->fingerprint_template),
                        'fingerprint_image' => $fp->fingerprint_image ?: null,
                        'fingerprint_captured_at' => $fp->fingerprint_captured_at,
                        'created_at' => $fp->created_at,
                        'updated_at' => $fp->updated_at,
                    ];
                }),
            ];
        });
        return response()->json($transformedEmployees);
    }

    public function create() {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(EmployeeRequest $request)
    {
        try {
            $fullName = $request->firstname . ' '
                . ($request->middlename ? $request->middlename . ' ' : '')
                . $request->lastname;

            $data = [
                'email'           => $request->email,
                'employeeid'      => $request->employeeid,
                'firstname'       => $request->firstname,
                'middlename'      => $request->middlename,
                'lastname'        => $request->lastname,
                'employee_name'   => $fullName,
                'phone'           => $request->phone,
                'gender'          => $request->gender,
                'status'          => $request->status,
                'work_status'     => $request->work_status,
                'service_tenure'  => $request->service_tenure,
                'date_of_birth'   => $request->date_of_birth,
                'department'      => $request->department,
                'position'        => $request->position,
            ];

            if ($request->hasFile('picture')) {
                $file = $request->file('picture');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('uploads', $filename, 'public');
                $data['picture'] = '/storage/' . $path;
            }

            $employee = Employee::create($data);

            if ($employee) {
                // Only return JSON for API requests
                if ($request->wantsJson() || $request->is('api/*')) {
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Employee created successfully.',
                        'employee' => $employee,
                    ], 201);
                }
                // For Inertia/web requests, always redirect
                return redirect()->route('employee.index')->with('success', 'Create employee successfully');
            }

            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unable to create employee. Please try again.'
                ], 500);
            }
            return redirect()->back()->with('error', 'Unable to create employee. Please try again.');
        } catch (\Exception $e) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to create employee Server error.'
                ], 500);
            }
            return redirect()->back()->with('error', 'Failed to create employee Server error.');
        }
    }

    public function show($id)
    {
        $employee = Employee::with('fingerprints')->findOrFail($id);
        $employee->fingerprints = $employee->fingerprints->map(function ($fp) {
            return [
                'id' => $fp->id,
                'employee_id' => $fp->employee_id,
                'finger_name' => $fp->finger_name,
                'fingerprint_template' => base64_encode($fp->fingerprint_template),
                'fingerprint_image' => $fp->fingerprint_image ? base64_encode($fp->fingerprint_image) : null,
                'fingerprint_captured_at' => $fp->fingerprint_captured_at,
                'created_at' => $fp->created_at,
                'updated_at' => $fp->updated_at,
            ];
        });
        return response()->json($employee);
    }

    public function edit(Employee $employee) {}

    public function update(Request $request, $id)
    {
        try {
            Log::info('Incoming request data:', $request->all());
            $rules = [
                'email' => 'email|string|max:100|unique:employees,email,' . $id,
                'employeeid' => 'string|max:100',
                'firstname' => 'string|max:100',
                'middlename' => 'nullable|string|max:100',
                'lastname' => 'string|max:100',
                'phone' => 'string|max:20',
                'department' => 'string|max:100',
                'position' => 'string|max:100',
                'status' => 'string|max:50',
                'service_tenure' => 'date',
                'gender' => 'string|max:50',
                'work_status' => 'max:50',
            ];
            if ($request->hasFile('picture')) {
                $rules['picture'] = 'image|mimes:jpeg,png,jpg,gif,webp|max:2048';
            }
            $validatedData = $request->validate($rules);
            Log::info('Validated data:', $validatedData);
            $employee = Employee::findOrFail($id);
            $fullName = $validatedData['firstname'] . ' ' .
                (!empty($validatedData['middlename']) ? $validatedData['middlename'] . ' ' : '') .
                $validatedData['lastname'];
            $validatedData['employee_name'] = $fullName;
            if ($request->hasFile('picture')) {
                Log::info('[DEBUG] Picture file received:', [
                    'filename' => $request->file('picture')->getClientOriginalName(),
                    'size' => $request->file('picture')->getSize(),
                ]);
                if ($employee->picture && file_exists(public_path($employee->picture))) {
                    Log::info('[DEBUG] Deleting old picture: ' . public_path($employee->picture));
                    unlink(public_path($employee->picture));
                }
                $file = $request->file('picture');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('uploads', $filename, 'public');
                Log::info('[DEBUG] File stored at path: ' . $path);
                $validatedData['picture'] = '/storage/' . $path;
            } else {
                Log::info('[DEBUG] No new picture uploaded, keeping old picture.');
                $validatedData['picture'] = $employee->picture;
            }
            Log::info('Final data before saving:', $validatedData);
            $employee->update($validatedData);
            Log::info('Employee updated successfully', ['employee_id' => $employee->id]);
            return redirect()->route('employee.index')->with('success', 'Employee updated successfully');
        } catch (\Exception $e) {
            Log::error('Employee Update Failed: ' . $e->getMessage());
            Log::info('Request all:', $request->all());
            return response()->json(['message' => 'Failed to update employee'], 500);
        }
    }

    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);
        $employee->delete();
        return redirect()->back()->with('success', 'Employee deleted');
    }
}
