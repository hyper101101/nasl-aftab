<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name') }}</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    @viteReactRefresh
    @vite(['resources/js/app.tsx'])
    @inertiaHead

</head>

<body>
    @inertia
</body>

</html>
