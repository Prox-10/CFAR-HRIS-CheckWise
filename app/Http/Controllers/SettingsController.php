<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Department;
use App\Models\Position;

class SettingsController extends Controller
{
    /**
     * Display the settings page with departments and positions
     */
    public function index(): Response
    {
        $departments = Department::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'is_active']);

        $positions = Position::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'is_active']);

        return Inertia::render('settings/index', [
            'departments' => $departments,
            'positions' => $positions,
        ]);
    }

    /**
     * Store a new department
     */
    public function storeDepartment(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string|max:1000',
        ]);

        Department::create([
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Department created successfully');
    }

    /**
     * Update a department
     */
    public function updateDepartment(Request $request, Department $department)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $department->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $department->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Department updated successfully');
    }

    /**
     * Delete a department
     */
    public function destroyDepartment(Department $department)
    {
        // Check if department has employees
        if ($department->employees()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete department that has employees assigned');
        }

        $department->update(['is_active' => false]);
        return redirect()->back()->with('success', 'Department deleted successfully');
    }

    /**
     * Store a new position
     */
    public function storePosition(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:positions,name',
            'description' => 'nullable|string|max:1000',
        ]);

        Position::create([
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Position created successfully');
    }

    /**
     * Update a position
     */
    public function updatePosition(Request $request, Position $position)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:positions,name,' . $position->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $position->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Position updated successfully');
    }

    /**
     * Delete a position
     */
    public function destroyPosition(Position $position)
    {
        // Check if position has employees
        if ($position->employees()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete position that has employees assigned');
        }

        $position->update(['is_active' => false]);
        return redirect()->back()->with('success', 'Position deleted successfully');
    }
}
