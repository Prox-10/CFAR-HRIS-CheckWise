<?php

namespace App\Http\Controllers;

use App\Models\AuthEmployee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuthEmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('employee_view/index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        return Inertia::render('employee_view/login');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(AuthEmployee $authEmployee)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AuthEmployee $authEmployee)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AuthEmployee $authEmployee)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AuthEmployee $authEmployee)
    {
        //
    }
}
