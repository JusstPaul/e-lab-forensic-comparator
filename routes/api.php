<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Mimey\MimeTypes;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
 */

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('/file', function (Request $request) {
        if (Storage::disk('s3')->exists($request->key)) {
            $explodedDot = explode('.', $request->key);
            $explodedSlash = explode('/', $request->key);
            $mimes = new MimeTypes;

            $file = Storage::disk('s3')->get($request->key);

            return response()->make($file, 200, [
                'Content-Type' => $mimes->getMimeType(end($explodedDot)),
                'Content-Disposition' => 'attachment; filename="' . end($explodedSlash) . '"',
            ]);
        } else {
            return response()->json([
                'file' => 'missing!',
            ], 500);
        }

    });
});
