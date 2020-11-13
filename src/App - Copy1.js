import React, {Component} from 'react';
// import Home from './components/Home'
// import MessageNav from './components/MessageNav'
// import DirectChat from './components/DirectChat'
import './App.css';

//socket io client
import socketIOClient from "socket.io-client";
//socket io endpoint - to be declared as env var
// const ENDPOINT = "https://gylsio.herokuapp.com";
const ENDPOINT = "http://localhost:5555";
// localStorage.debug = '*';


class App extends Component {

  // init constructor
  constructor(props){
    super(props);
    this.state = {
      title: 'Gyl Sample - to be fixed later gonna sleep for now 6am',
      act:0,
      index:'',
      datas:[],
      response:{},
      username:'',
      messages:[],
      users:[],
      isNameSet:false,
      currentUser:{},
      userMap:[]

    }
    this.myForm1 = React.createRef();
    this.dcForm = React.createRef();
    this.dcText = React.createRef();
    this.dcForm = React.createRef();

    //connecting to socket
    this.state.socket = socketIOClient(ENDPOINT,  {transports: ['websocket']});
  }

  //onload component 
 componentDidMount(){
   this.refs.name.focus();

    this.state.socket.on("connect", this.onConnect);
    this.state.socket.on("disconnect", this.onDisconnect);
    this.state.socket.on("user disconnected", this.onUserDisconnected);


    //this.state.socket.emit("new user","test",this.onEmit);

    //recv new user
    this.state.socket.on("new user", this.onNewUser);
    //recv chat
    this.state.socket.on("chat message", this.onChatMessage);
    this.state.socket.on("event", this.onRecvEvent);


    //new event
    this.state.socket.on("_fetchUsers", this.onfetchUsers);

 }

 onDebug = resp => {
    console.log('onDebug');
    console.log(resp);
 }

  //recv chat callback
  onChatMessage = resp => {
    console.log('onChatMessage');
    console.log(resp);
    this.state.messages.push(resp);
    console.log(this.state.messages);
    this.setState({
      'messages': this.state.messages,
    });
    console.log(this.state.messages);
  };
  //recv chat callback
  onNewUser = newUser => {
    //array string newUser
    console.log('onNewUser');
    console.log(newUser);
    this.setState({
      'users': newUser,
    });
    console.log(this.state.users)
  };




  onConnect = r  => {
    console.log('onConnect');
    console.log(this.state.socket);
  };

  onDisconnect = r  => {
    console.log('onDisconnect');
    console.log(r);
  };
  onEmit = r  => {
    console.log('onEmit');
    console.log(r);
  };
  onTyping = resp => {
    console.log('onTyping');
    console.log(resp);
  };

  onUserDisconnected = resp => {
    console.log('onUserDisconnected');
    console.log(resp);
    var index = this.state.users.indexOf(resp)
    if (index !== -1) {
      this.state.users.splice(index, 1);
      this.setState({users: this.state.users});
    }


    console.log(this.state.users);
  };
  onRecvEvent = resp => {
    console.log('onRecvEvent');
    console.log(resp);
  };

 // on unload 
 componentWillUnmount() {
    this.state.socket.off("typing", this.onTyping);
    this.state.socket.off("chat message", this.onChatMessage);
    this.state.socket.off("new user", this.onNewUser);
    this.state.socket.off("user disconnected", this.onUserDisconnected);
    this.state.socket.off("debug", this.onDebug);
  }

 fSubmit =(e)=>{
  e.preventDefault();
  console.log('test');

   let datas = this.state.datas;
   let name = this.refs.name.value;
   let address = this.refs.address.value;
  console.log('name :'+name);
  console.log('address :'+address);

  let data  = {
    name, 
    address
  }



  datas.push(data);

  this.setState({
    datas : datas
  });

  this.myForm1.reset();
  this.refs.name.focus();


 }

  //set username
  fSetUserName =(e)=>{
    console.log('fSetUserName')
    e.preventDefault();   
    let name = this.refs.name.value;
    console.log(this.state.socket.connected);
    if(!this.state.socket.connected){
      return;
    }
    console.log(this.state.socket.connected);
    this.state.socket.emit("_login",name);

    this.setState({
      'isNameSet':true,
      'username':name
    })

  }

  //sendMessage
  fSendMessage =(e)=>{
    console.log('fSendMessage')
    e.preventDefault();   
    let msg = this.refs.msg.value;
    console.log(this.state.socket.connected);
    if(!this.state.socket.connected){
      return;
    }
    console.log(this.state.socket.connected);
    this.state.socket.emit("chat message",{'nick':this.state.username,'message':msg},this.onEmit);


    this.refs.msgForm.reset();
    this.refs.msg.focus();

  }



  //sendDcMessage
  fSendDcMessage =(e)=>{
    console.log('fSendDcMessage')
    e.preventDefault();   
    // let msg = this.refs.msg.value;
    // console.log(this.state.socket.connected);
    // if(!this.state.socket.connected){
    //   return;
    // }
    // console.log(this.state.socket.connected);
    // this.state.socket.emit("chat message",{'nick':this.state.username,'message':msg},this.onEmit);


    // this.refs.msgForm.reset();
    // this.refs.msg.focus();

  }




  render(){
    const {users, messages, isNameSet}= this.state;
      console.log(users);
    return (
      <div className="App">

        <div className="card direct-chat direct-chat-primary">
          <div className="card-header">
            <h3 className="card-title">Direct Chat</h3>

            <div className="card-tools">
              <span data-toggle="tooltip" title="3 New Messages" className="badge badge-primary">3</span>
              <button type="button" className="btn btn-tool" data-card-widget="collapse">
                <i className="fas fa-minus"></i>
              </button>
              <button type="button" className="btn btn-tool" data-toggle="tooltip" title="Contacts"
                      data-widget="chat-pane-toggle">
                <i className="fas fa-comments"></i>
              </button>
              <button type="button" className="btn btn-tool" data-card-widget="remove"><i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="card-body">
            <div className="direct-chat-messages">

              <div className="direct-chat-msg">
                <div className="direct-chat-infos clearfix">
                  <span className="direct-chat-name float-left">Alexander Pierce</span>
                  <span className="direct-chat-timestamp float-right">23 Jan 2:00 pm</span>
                </div>
                <div className="direct-chat-text">
                  Is this template really for free? That's unbelievable!
                </div>
              </div>

              <div className="direct-chat-msg right">
                <div className="direct-chat-infos clearfix">
                  <span className="direct-chat-name float-right">Sarah Bullock</span>
                  <span className="direct-chat-timestamp float-left">23 Jan 2:05 pm</span>
                </div>
                <div className="direct-chat-text">
                  You better believe it!
                </div>
              </div>


            </div>

            <div className="direct-chat-contacts">
              <ul className="contacts-list">

                {users.map((user,i)=>
                  <li>
                    <a href="/">
                      <div className="contacts-list-info">
                        <span className="contacts-list-name">
                          {user}
                          <small className="contacts-list-date float-right">2/28/2015</small>
                        </span>
                        <span className="contacts-list-msg">How have you been? I was...</span>
                      </div>
                    </a>
                  </li>
                )}
                
              </ul>
            </div>






          </div>
          <div className="card-footer">
            <form ref={this.dcForm} action="#">
              <div className="input-group">
                <input type="text" ref={this.dcText} placeholder="Type Message" className="form-control"/>
                <span className="input-group-append">
                  <button type="button" onClick={this.fSendDcMessage} className="btn btn-primary">Send</button>
                </span>
              </div>
            </form>
          </div>


        </div>



















        <h2>{this.state.title}</h2>
        <div className="userDiv">
          <b>Online:</b>
          {users.map((user,i)=>
            <p><small key={i}>{user}</small></p>
          )}
        </div>
        {!isNameSet && (
        <form ref={this.myForm1} className="myForm1">
          <input type="text" ref="name" placeholder="your name" className="formfield"/>
          <button onClick={this.fSetUserName} className="myButton">Set Name</button>
        </form>
        )}

        {isNameSet && (
          <form ref="msgForm" className="msgForm">
            <textarea type="text" ref="msg" placeholder="Your Message:" className="formfield"/>
            <button onClick={this.fSendMessage} className="myButton">Send</button>
          </form>
        )}

        {isNameSet && (
          <div className="msgDiv">
            <b>Messages:</b>
            {messages.map((msg,i)=>
              <p><b key={i}>{msg.nick}</b>: {msg.message}</p>
            )}
          </div>
        )}





      </div>
    );
  }
}

export default App;
