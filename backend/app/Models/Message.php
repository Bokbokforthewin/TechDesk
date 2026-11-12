<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Message extends Model
{
    use HasFactory;

    protected $table = 'messages';
    protected $primaryKey = 'message_id';
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'sender_id',
        'message_content',
        'sent_at',
        'is_read',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id', 'user_id');
    }

    public function request()
    {
        return $this->belongsTo(AssistanceRequest::class, 'request_id', 'request_id');
    }
}