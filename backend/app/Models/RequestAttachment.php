<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestAttachment extends Model
{
    use HasFactory;

    protected $table = 'request_attachments';
    protected $primaryKey = 'attachment_id';
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'file_name',
        'file_path',
        'uploaded_at',
    ];

    public function request()
    {
        return $this->belongsTo(AssistanceRequest::class, 'request_id', 'request_id');
    }
}