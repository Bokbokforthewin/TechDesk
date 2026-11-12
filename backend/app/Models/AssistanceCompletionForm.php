<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssistanceCompletionForm extends Model
{
    use HasFactory;

    protected $table = 'assistance_completion_forms';
    protected $primaryKey = 'form_id';
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'user_id',
        'form_data',
        'submitted_at',
    ];

    protected $casts = [
        'form_data' => 'array',
    ];

    public function request()
    {
        return $this->belongsTo(AssistanceRequest::class, 'request_id', 'request_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}