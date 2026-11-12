<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssistanceRequest extends Model
{
    use HasFactory;

    protected $table = 'assistance_requests';
    protected $primaryKey = 'request_id';
    public $timestamps = false; // Using database DATETIME defaults

    protected $fillable = [
        'user_id',
        'assigned_ictu_id',
        'request_type',
        'subject',
        'description',
        'preferred_date',
        'preferred_time',
        'scheduled_date',
        'scheduled_time',
        'estimated_duration',
        'status',
        'rejection_reason',
        'reassignment_reason',
        'ictu_remarks',
        'submitted_at',
        'updated_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function assignedIctu()
    {
        return $this->belongsTo(User::class, 'assigned_ictu_id', 'user_id');
    }

    public function attachments()
    {
        return $this->hasMany(RequestAttachment::class, 'request_id', 'request_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'request_id', 'request_id');
    }
}