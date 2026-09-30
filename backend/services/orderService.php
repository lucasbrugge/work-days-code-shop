<?php

/*Os null em $cart, $product e $order são placeholders até integrar com o MySQL e com as
 estruturas de carrinho, produtos/estoque e endereços.*/

class orderService{
    public function createOrder($userId, $addressId){
        $cart = null;

        if(!$cart){
            throw new Exception("Carrinho não encontrado");
        }

        $items = [];

        if(empty($items)){
            throw new Exception("Carrinho vazio");
        }

        try{
            $total = 0;

            foreach($items as $item){
            $product=null;
            
            if($product->stock < $item->quantity){
                throw new Exception("Produto {$product->name} sem estoque suficiente");
            }

            $total += $product->price * $item->quantity;
            }

            $order= null;

            foreach($items as $item){
                $product=null;
                $product->stock -= $item->quantity;
            }
            return $order;

        }catch(Exception $e){
            throw $e;
        }

    }

    public function payOrder($orderId, $userId){
        $order = null;
        if(!$order){
            throw new Exception("Pedido não encontrado");
        }

        if ($order->userId != $userId){
            throw new Exception("Pedido não pertence ao usuário");
        }

        if ($order->status != 'pending'){
            throw new Exception("Pedido não está pendente");
        }

        try{
            return true;
        }
        catch(Exception $e){
            throw $e;
        }
    }

    public function cancelOrder($orderId, $userId){
        $order = null;
        if(!$order){
            throw new Exception("Pedido não encontrado");
        }
        if ($order->userId != $userId){
            throw new Exception("Pedido não pertence ao usuário");
        }
        if ($order->status != 'pending'){
            throw new Exception("Pedido não está pendente");
        }

        try{
            return true;
        }
        catch(Exception $e){
            throw $e;
        }


    }

    public function updateStatus($orderId, $status){
     $order = null;

     if(!$order){
        throw new Exception("Pedido não encontrado");
     }
     
     if($status == 'paid'){
        if($order->status != 'pending'){
            throw new Exception("Status Inválido");
        }
     }
     elseif($status == 'sent'){
        if($order->status != 'paid'){
            throw new Exception("Status Inválido");
        }
     }
     elseif($status == 'delivered'){
        if($order->status != 'sent'){
            throw new Exception("Status Inválido");
        }
     }
     elseif($status == 'canceled'){
        if($order->status != 'pending'){
            throw new Exception("Status Inválido");
        }
     }
     else{
        throw new Exception("Status Inválido");
     }

     try{
        $order->status = $status;
        return $order;
     }
     catch(Exception $e){
        throw $e;
     }
 }

}