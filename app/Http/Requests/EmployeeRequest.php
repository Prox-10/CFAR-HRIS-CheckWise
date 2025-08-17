<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        $employeeId = $this->route('employee') ? $this->route('employee')->id : null;

        return [
            'email' => ['required', 'email', Rule::unique('employees')->ignore($employeeId)],
            'employeeid' => ['required', 'string', 'max:255', Rule::unique('employees')->ignore($employeeId)],
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'phone' => 'nullable|string|min:11',
            'gender' => 'required|string|max:255',
            'marital_status' => 'required|string|max:255',
            'nationality' => 'nullable|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'zip_code' => 'required|string|max:255',
            'work_status' => 'required|string|max:255',
            'service_tenure' => 'required|date',
            'date_of_birth' => 'required|date',
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'picture' => 'nullable|image|max:2048',
            'sss' => 'nullable|string|max:255',
            'pag_ibig' => 'nullable|string|max:255',
            'philhealth' => 'nullable|string|max:255',
            'tin' => 'nullable|string|max:255',
            'gmail_password' => 'nullable|string|max:255',
            'recommendation_letter' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,gif,bmp,tiff,txt,rtf|max:10240', // 10MB max
            'fingerprint_template'    => 'nullable|string',
            'fingerprint_image'       => 'nullable|string',
            'fingerprint_captured_at' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'Please enter the product name.',
            'name.string'          => 'The product name must be a string.',
            'name.max'             => 'The product name may not be greater than 255 characters.',
            'description.required' => 'Please enter product description.',
            'description.string'   => 'The product description must be a string.',
            'description.max'      => 'The product description may not be greater than 1000 characters.',
            'price.required'       => 'Please enter the product price.',
            'price.numeric'        => 'The product price must be a number.',
            'price.min'            => 'The product price must be at least 0.',
            'featured_image.image' => 'The featured image must be an image file.',
            'featured_image.mimes' => 'The featured image must be a file of type: jpeg, png, jpg, gif, webp.',
            'featured_image.max'   => 'The featured image may not be greater than 2048 KB.',
            'recommendation_letter.file' => 'The recommendation letter must be a file.',
            'recommendation_letter.mimes' => 'The recommendation letter must be a file of type: pdf, doc, docx, jpg, jpeg, png, gif, bmp, tiff, txt, rtf.',
            'recommendation_letter.max' => 'The recommendation letter may not be greater than 10MB.',
        ];
    }
}
