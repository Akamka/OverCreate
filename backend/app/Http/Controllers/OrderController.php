<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // список для админки
    public function index(Request $req) {
        $q = Order::query()->latest();
        if ($req->boolean('only_new')) $q->where('is_new', true);
        return response()->json( $q->paginate(20) );
    }

    // создать заказ из формы
    public function store(StoreOrderRequest $req) {
        $order = Order::create($req->validated());
        return response()->json($order, 201);
    }

    // отметить как прочитано
    public function markRead(Order $order) {
        $order->is_new = false;
        $order->save();
        return response()->json(['ok'=>true]);
    }
}
