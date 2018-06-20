;(function($){
	//CacheDOM 
	var $el = $('#sub-addition') 
	var template = $el.html() //el->ref a html (parte de los subs) 

	//bindEvents (evento enlazado)
	$el.delegate('button','click',op)

	render()

	function op(event){
		$currentEl = $(event.target) 
		name = $el.find('input')[0].value
		operation = $currentEl.html().toLowerCase() 
		events.trigger("sub_" + operation,name)
		render() //se vacia el textbox
	}

	function render(){
		$el.find('input').val('')
	}
})(jQuery);


(function(){
	//CacheDOM
	var $el = $('#pub-addition') //el->ref a html (parte de los subs)
	var template = $el.html()

	//bindEvents (evento enlazado)
	$el.delegate('button','click',op)

	render()

	function op(event){
		$currentEl = $(event.target)
		name = $el.find('input')[0].value
		operation = $currentEl.html().toLowerCase()
		events.trigger("pub_" + operation,name)
		render() //se vacia el textbox
	}

	function render(){
		$el.find('input').val('')
	}
})();


var Subscriber = (function(){ //Clase Subscriber

	var subscribers = [];

	var $el = $('#subscriber-list') //ref a html (parte del listado Subs)
	var template = $el.html()
	
	//bindEvents (eventos enlazados)
	$el.delegate('button','click',addTopic) //addTopic->metodo
	events.on('notify', _notify) //notify->metodo ojo metodo para recibir notificaciones
	events.on('sub_add', add) //add->metodo
	events.on('sub_remove', remove) //remove->metodo

	_render() // actuliza la lista de subs; se usa mustache

	function _render(){
		data = {
				subscribers: subscribers //lista de subs
		}

		$el.html(Mustache.render(template, data)) //template -> pagina html
	}

	function get(indx){
		indx = indx || -1
		if(indx != -1)
			return subscribers[indx] //retornamos el subs con el indice=indx
		return subscribers; //retornamos todos los subs
	}

	function add(name){ //añadimos un subs
		subs = subscribers.map(function(sub, indx){
			return sub.name.toLowerCase()
		});

		indx = subs.indexOf(name.toLowerCase())
		if(indx != -1) {
			alert(name + ' ya existe!')
			return
		}

		subscribers.push({'name' : name})
		_render()
	}

	function remove(name){ //borramos subs
		subs = subscribers.map(function(sub, indx){
			return sub.name
		});

		indx = subs.indexOf(name)

		if(indx != -1) {
			subscribers.splice(indx, 1)
			_render()
			return
		}

		alert(name + ' no existe!')
	}

	function _notify(info){ //notificamos (enviamos los mensaje a los subs)
		subscribers.forEach(function(sub, indx){ //recorremos todos los subs
			sub.topics = sub.topics || [] //inicializamos topics[] o mantenemos valor
			sub.notifications = sub.notifications || [] //inicializamos notifications[] o mantenemos valor
			if(sub.topics.indexOf(info.topic) != -1) //preguntamos si tiene topics
				sub.notifications.push(info) //notificamos
		});

		_render() //actualizamos
	}


	function addTopic(event){ //añadimos topics a un subs
		//capturamos los datos del subs 
		$currentEl = $(event.target)
        $sub = $currentEl.closest('.subscriber');
        name = $sub.find('h4').html();
        topic = $sub.find('input')[0].value;

		subscribers.forEach(function(sub, indx){
			if(name.toLowerCase() == sub.name.toLowerCase()){ //solo al subs en cuestion
				sub.topics = sub.topics || [] //For new subscribers, there is no topics array. So, if this is the case, initialize it to empty list: []
				if(sub.topics.indexOf(topic) == -1){
					sub.topics.push(topic); //añadimos topics
					_render() //actualizamos
					return;
				}
			}
		});
	}

	//No DOM for this yet..
	function removeTopic(topic){
		indx = Subscribers.indexOf(topic)
		if(indx != -1) {
			topics.splice(indx,1);
			_render()
		}
	}

	return{
		get: get,
		unsubscribe: removeTopic
	}
})();
var Publisher = (function(){ //Clase Publisher

	var publishers = []

	//cacheDOM
	var $el = $('#publisher-list') //ref a html (parte del listado Pubs)
	var template = $el.html()

	//bindEvents (DOM)
	$el.delegate('button','click',send) // metodo->send

	//bindEvents (PubSub)
	events.on('pub_add', add) // metedo->add
	events.on('pub_remove', remove) //metodo->remove

	_render(); //actualiza

	function _render(){
		data = {
				publishers: publishers
		}
		$el.html(Mustache.render(template, data))
	}

	function get(indx){ //retorna un pub con indice=indx
		indx = indx || -1
		if(indx != -1)
			return publishers[indx]
		return publishers;
	}

	function add(name){//añadimos pub

		pubs = publishers.map(function(pub, indx){
			return pub.name.toLowerCase()
		});

		indx = pubs.indexOf(name.toLowerCase())
		if(indx != -1) {
			alert(name + ' ya es publisher!')
			return
		}

		publishers.push({'name' : name})
		_render()
	}

	function remove(pub){ //borramos pub
		pubs = publishers.map(function(publisher){
			return publisher.name;
		});

		indx = pubs.indexOf(pub);

		if(indx != -1) {
			publishers.splice(indx, 1)
			_render()
		}
	}

	function send(event){ //metodo para enviar mensaje
		
		$currentEl = $(event.target)
        $pub = $currentEl.closest('.publisher');
        name = $pub.find('h4').html();
        topic = $pub.find('input')[0].value;
        payload = $pub.find('textarea')[0].value;

		work = { //work contiene las variables nombre, topic, payload 
			'name':name,
			'topic': topic,
			'payload': payload
		};

		pubs = publishers.map(function(publisher){
			return publisher.name;
		});

		indx = pubs.indexOf(work.name);

		publishers[indx].works = publishers[indx].works || [] //inicializamos atributo work[] o mantenemos su valor 

		publishers[indx].works.push({ //añadimos un work
			'topic':topic,
			'payload':payload
		});

		_render(); //actializamos

		events.trigger('notify', work) //publicamos el work
	}

	return {
		get: get,
		send: send
	}

})();
