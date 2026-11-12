<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Define the custom primary key
    protected $primaryKey = 'user_id';

    protected $fillable = [
        'name',
        'email',
        'password',
        'designation',
        'unit',
        'division',
    ];

    protected $hidden = [
        'password',
    ];

    // Disable default timestamps if they don't match exactly, 
    // but Laravel handles created_at/updated_at automatically by default.
    public $timestamps = false; // We set useCurrent() in migrations, so we can let the DB handle it, or keep it true if you want Eloquent to manage it. Let's set it to false so MySQL's CURRENT_TIMESTAMP handles it perfectly.
}