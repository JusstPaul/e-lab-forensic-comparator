<?php

namespace App\Http\Middleware;

use App\Models\ActivitiesAnswer;
use App\Models\Classes;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Vinkla\Hashids\Facades\Hashids;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Defines the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'user' => function () {
                $user = auth()->user();
                $role = 'guest';
                $name = '';
                $sidebar = [];
                $token = '';

                if ($user != null) {
                    $role = $user->roles->first()->name;
                    $id = $user->id;
                    $token = $user->createToken("api-requests-$id")->plainTextToken;

                    $profile = $user->profile;
                    if ($profile != null) {
                        if ($profile->last_name == null || $profile->last_name == '') {
                            $name = $profile->last_name . ', ' . $profile->first_name;
                        } else {
                            $name = $profile->last_name . ', ' . $profile->first_name . ' ' . $profile->middle_name[0] . '.';
                        }
                    }
                }

                if ($role == 'student') {
                    $classes = $user->joined_class;

                    if ($classes != null) {
                        $assignments = [];
                        $exams = [];

                        $activities = $classes->activities()->get();
                        foreach ($activities as $activity) {
                            $answer = ActivitiesAnswer::where('student_id', $user->id)->where('activity_id', $activity['id'])->first();
                            if ($answer != null) {
                                continue;
                            }

                            $item = [
                                'display' => $activity['title'],
                                'link' => '/' . 'class/' . Hashids::encode($classes->id) . '/' . 'activity/' . Hashids::encode($activity['id']),
                            ];

                            if ($activity['type'] == 'assignment') {
                                array_push($assignments, $item);
                            } else if ($activity['type'] == 'exam') {
                                array_push($exams, $item);
                            }
                        }

                        $sidebar = [
                            [
                                'title' => 'Exams',
                                'elements' => $exams,
                            ],
                            [
                                'title' => 'Assignments',
                                'elements' => $assignments,
                            ],
                        ];
                    }
                } else if ($role == 'instructor') {
                    $classes = $user->classes()->get();
                    $classes_collection = [];

                    foreach ($classes as $class_) {
                        array_push($classes_collection, [
                            'display' => $class_->code,
                            'link' => '/class/overview/' . Hashids::encode($class_->id),
                        ]);
                    }

                    $sidebar = [
                        [
                            'title' => 'Classes',
                            'elements' => $classes_collection,
                        ],
                    ];
                }

                return [
                    'id' => $user == null ? '' : Hashids::encode($user->id),
                    'role' => $role,
                    'name' => $name,
                    'sidebar' => $sidebar,
                    'token' => $token,
                ];
            },
            'aws' => [
                'access_key_id' => env('AWS_ACCESS_KEY_ID'),
                'secret_access_key' => env('AWS_SECRET_ACCESS_KEY'),
                'default_region' => env('AWS_DEFAULT_REGION'),
                'bucket' => env('AWS_BUCKET'),
            ],
        ]);
    }
}
