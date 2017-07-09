// if in beta, use "http://buttery-1-bkitano.c9users.io"
        // to push to production, use "https://buttery.herokuapp.com"
        
        // var socket = io.connect('https://buttery-1-bkitano.c9users.io/');
        // var socket = io.connect('https://buttery.herokuapp.com');
        var socket = io.connect(window.location.origin);
        
        var url = window.location.pathname;
        var college = url.split('/')[1];

        socket.on('connect', function(data) {
                socket.emit('join', 'Hello World from buttery client');
            });

        // when someone submits an order, emit a socket
        $('form').submit( function(e) {
            e.preventDefault();
            var name = $('#name').val();
            var order = $('#order').val();
            socket.emit('order-from-client', {'name':name, 'order':order, 'college':college});
        });

        // 1a-c. when the server recieves an order, client animation
        socket.on('order-to-client', function(data) {
            var $order = "<tr id=" + data.id + "> <td class='name'>" + data.name + "</td> <td class='items'>"+data.order+"</td> <td> <button class='btn btn-success complete'>Complete</button> </td> </tr>";
            $('#received-orders').append($order);
        });
        
        // 2ab-c. when someone marks an order as complete
        $('#received-orders').on('click', '.complete', function() {
            var $order = $(this).parent().parent();
            var order = {
                'id': $order.attr('id'),
                'name': $order.find('.name').text(),
                'items': $order.find('.items').text()
            };
            
            // 2a-cl
            // $order.find('button').attr('class', 'btn btn-primary picked-up');
            // $order.find('button').text('Picked Up');
            // $('#completed-orders-list').append($order);
            
            // 2a-c
            socket.emit('order-marked-complete', {'order': order,'college':college});
        });
        
        // 2b-c. when the server tells the client the order was marked complete
        socket.on('marked-complete-to-clients', function(data) {
            console.log('marked-complete-to-clients');
            var order = "<tr id=" + data.order.id + "> <td class='name'>" + data.order.name + "</td> <td class='items'>"+data.order.items+"</td> <td> <button class='btn btn-primary picked-up'>Picked Up</button> </td> </tr>";            
            console.log(order);
            $('#completed-orders-list').append(order);
            
            var find_param = 'tr[id='+String(data.order.id) + ']';
            $('#received-orders-list').find(find_param).fadeOut('slow');
        });
        
        // when someone marks an order as picked-up
        $('#completed-orders').on('click', '.picked-up', function() {
            var $order = $(this).parent().parent();
            var order = {
                'id': $order.attr('id'),
                'name': $order.find('.name').text(),
                'items': $order.find('.items').text()
            };

            socket.emit('order-picked-up', {'order':order,'college':college});
        });
        
        // distributing the picked-up notification
        socket.on('picked-up-to-clients', function(data) {
            var find_param = 'tr[id='+String(data.order.id) + ']';
            $('#completed-orders-list').find(find_param).fadeOut('slow');
        });
        