import React, {Component} from 'react';
import moment from 'moment';
//.tz("", "Asia/Manila")


// import Home from './components/Home'
// import MessageNav from './components/MessageNav'
// import DirectChat from './components/DirectChat'
import './App.css';

//socket io client
import socketIOClient from "socket.io-client";
//socket io endpoint - to be declared as env var
const LIVE_ENDPOINT = "https://gylsio.herokuapp.com";
const LOCAL_ENDPOINT = "http://localhost:5555";
const IS_DEBUG = true;
const IO_OPTS = {
    transports: ['websocket'],
    autoConnect: false
  };

const DEFAULT_IMAGE_URL = process.env.PUBLIC_URL +"/logo192.png";
const DISCONNECTED_STRING  = "Disconnected to Server";
const SERVER_OFFLINE_STRING = "Server Offline, try again later";


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
      messages:{},
      users:[],
      isNameSet:false,
      currentUser:{},
      userMap:{},
      currentContact:{},
      currentMessages:[],
      onlineUserCount:0,
      activeUserCount:0,


    }

    this.dcForm = React.createRef();
    this.dcText = React.createRef();
    this.dcForm = React.createRef();
    this.loginForm = React.createRef();
    this.loginText = React.createRef();
    this.btnContact = React.createRef();
    this.messagesEnd = React.createRef();

    //connecting to socket
    this.consoleLogThis("test");

      if(IS_DEBUG){
        this.state.socket = socketIOClient(LOCAL_ENDPOINT,  IO_OPTS);
        localStorage.debug = '*';
      }else{
        this.state.socket = socketIOClient(LIVE_ENDPOINT,  IO_OPTS);
        localStorage.debug = '';
      }
  }

  //onload component 
  componentDidMount(){
    this.state.socket.on("connect", this.onConnect);
    this.state.socket.on("disconnect", this.onDisconnect);

    //_setUser
    this.state.socket.on("_setUser", this.onSetUser);

    //_fetchUsers
    this.state.socket.on("_fetchUsers", this.onFetchUsers);
    
    //_userDisconnected
    this.state.socket.on("_userDisconnected", this.onUserDisconnected);

    //onEmit
    this.state.socket.on("onEmit", this.onEmit);

    //onRecvMessage
    this.state.socket.on("_recvMessage", this.onRecvMessage);

    this.state.socket.on("_emitOnlineActive", this.onRecvOnlineActive);

    if(!this.state.socket.connected){
      this.state.socket.open();
    }
  }


  // on unload 
  componentWillUnmount() {
    this.state.socket.off("connect", this.onConnect);
    this.state.socket.off("disconnect", this.onDisconnect);

    //_setUser
    this.state.socket.off("_setUser", this.onSetUser);

    //_fetchUsers
    this.state.socket.off("_fetchUsers", this.onFetchUsers);

    //_userDisconnected
    this.state.socket.off("_userDisconnected", this.onUserDisconnected);

    //onEmit
    this.state.socket.off("onEmit", this.onEmit);

    //onRecvMessage
    this.state.socket.off("_recvMessage", this.onRecvMessage);


    this.state.socket.off("_emitOnlineActive", this.onRecvOnlineActive);

    this.state.socket.disconnect();

  }


  componentDidUpdate() {
    this.scrollToBottom();
  }

  onConnect = r  => {
    this.consoleLogThis('onConnect');
    this.consoleLogThis(this.state.socket.id);
  };

  onDisconnect = r  => {
    //alert when disconnected
    alert(DISCONNECTED_STRING);
    this.consoleLogThis('onDisconnect');
    //reset state
    this.setState({
      'isNameSet':false,
      'messages':{},
      'currentUser':{},
      'userMap':{},
      'currentContact':{},
      'currentMessages':[],
    });
  };


  onSetUser = currentUser  => {
    this.consoleLogThis('onSetUser  ');
    this.consoleLogThis(currentUser);
    this.setState({
      'isNameSet':true,
      'currentUser':currentUser
    });
    if(this.btnContact.current){
      this.btnContact.current.click();
    }
  };

  onFetchUsers = userMap  => {
    this.consoleLogThis('onFetchUsers ');
    this.consoleLogThis(userMap);
    this.setState({
      'userMap':userMap
    })

  };


  onEmit = r  => {
    this.consoleLogThis('onEmit');
    this.consoleLogThis(r);
  };

  onUserDisconnected = uid  => {
    this.consoleLogThis('onUserDisconnected');

    //deleting disconnected users by uid
    this.deleteUserInUserMapByUID(uid);

    //update display
    if(this.isCurrentContactByUID(uid)){
      this.setState({
        'currentContact':{},
        'currentMessages':[]
      });
      this.deleteMessageByUID(uid);
    }
  };

  onRecvMessage = data  => {
    this.consoleLogThis('onRecvMessage');
    this.consoleLogThis(data);


    //add to messages stack
    var m = this.state.messages;
    if(!m.hasOwnProperty(data.from)){
      m[data.from] = [];
    }
    m[data.from].push(data);
    this.setState({
      'messages': m,
    });


    //set current Message Display
    if(this.isCurrentContactByUID(data.from)){
      var currentMessages = m[data.from];
      this.setState({
        'currentMessages': currentMessages
      });
    }

    //add messageText and date_sent to contact
    var um = this.state.userMap;
    um[data.from]["messageText"] = data.messageText;
    um[data.from]["date_sent"] = data.date_sent;
    this.setState({
      'userMap': um
    });

  };

  onRecvOnlineActive = data  => {
    this.consoleLogThis('onRecvOnlineActive');
    this.consoleLogThis(data);

    this.setState({
      onlineUserCount:data.onlineUserCount,
      activeUserCount:data.activeUserCount,
    });

  };


  //set username
  fLoginUser =(e)=>{
    this.consoleLogThis('fSetUserName ')
    e.preventDefault();   
    let username = this.loginText.current.value;//.toString;
    if(!this.state.socket.connected){
      this.consoleLogThis("not connected");
      alert(SERVER_OFFLINE_STRING)
      return;
    }
    this.consoleLogThis("connected");
    this.state.socket.emit("_login",username);

    this.setState({
      'username':username
    });
    if(this.btnContact.current){
      this.btnContact.current.click();
    }
  };

  selectCurrentContact =(key)=>{
    this.consoleLogThis('selectCurrentContact');
    this.consoleLogThis(key);
    this.btnContact.current.click();
    var m = this.state.messages;
    this.consoleLogThis(m);

    if(!m.hasOwnProperty(key)){
      m[key] = [];
    }
    var currentMessages = m[key];
    this.consoleLogThis(currentMessages);

    this.setState({
      'currentContact':this.state.userMap[key],
      'currentMessages': currentMessages,
      'messages': m,
    });
    
  };

  fSendDcMessage =(e)=>{
    this.consoleLogThis('fSendDcMessage')
    e.preventDefault();   
    var cc = this.state.currentContact;
    if (Object.keys(cc).length === 0) {
      this.consoleLogThis(cc);
      alert("Select a Stranger");
      return;
    }
    if(!this.state.socket.connected){
      this.consoleLogThis("not connected");
      alert("Server Offline, try again later")
      return;
    }
    var cu = this.state.currentUser;
    var messageText = this.dcText.current.value;
    if(messageText===""){
      return;
    }
    var current_time = new Date().getTime();
    var message = {
      "temp_id":this.randomString(3)+current_time,
      "to":cc.uid,
      "to_name":cc.name,
      "messageText":messageText,
      "from":cu.uid,
      "from_name":cu.name,
      "date_sent": current_time
    }
    var m = this.state.messages;
    if(!m.hasOwnProperty(cu.uid)){
      m[cu.uid] = [];
    }
    m[cu.uid].push(message);

    var cm = this.state.currentMessages;
    cm.push(message);

    this.setState({
      'currentMessages': cm,
      'messages': m
    });
    this.dcForm.current.reset();

    this.scrollToBottom();

    this.state.socket.emit("_sendMessage",message,this.onEmit);
  };


  deleteUserInUserMapByUID = uid => {
    var um = this.state.userMap;
    delete um[uid];
    this.setState({
      'userMap':um
    });
  };

  deleteMessageByUID = uid => {
    var m = this.state.messages;
    delete m[uid];
    this.setState({
      'messages':m
    });
  };

  isCurrentContactByUID = uid => {
    if(this.state.currentContact){
      if(this.state.currentContact.uid === uid){
        return true;
      }
    }
    return false;
  };


  getTimeString = (ts)=>{
    // var dt = new Date(ts);
    // var date_format_str = 
    //   (dt.getMonth()+1).toString().padStart(2, '0')+ "/"+ 
    //   dt.getDate().toString().padStart(2, '0') + "/"+ 
    //   dt.getFullYear().toString().padStart(4, '0') + " "+ 
    //   dt.getHours().toString().padStart(2, '0')+ ":"+
    //   dt.getMinutes().toString().padStart(2, '0')+ ":"+
    //   dt.getSeconds().toString().padStart(2, '0');
    // return date_format_str;



    return moment(ts).fromNow();
  };

  randomString =(length)=>{
     var result           = '';
     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
     var charactersLength = characters.length;
     for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }
     return result;
  };

  consoleLogThis =(s)=>{
    if(IS_DEBUG){
      console.log(s);
    }
  };

  scrollToBottom = () => {
    if(this.messagesEnd.current){
      this.messagesEnd.current.scrollIntoView({ behavior: 'smooth' })
    }
  };

  render(){
    const {
      isNameSet, 
      currentUser, 
      userMap, 
      currentContact, 
      currentMessages,
      activeUserCount,
      onlineUserCount
    } = this.state;

    return (
      <div className="App">

        {!isNameSet && (
          <div>
            <h3 className="text-center">Welcome, Stranger</h3>
          </div>
        )}

        {isNameSet && (
          <div>
            <h3 className="text-center blue">Welcome, {currentUser.name}</h3>
            <div><small>active: {activeUserCount}</small> | <small>online:{onlineUserCount}</small></div>
          </div>
        )}
        <div className="card direct-chat direct-chat-primary">
          <div className="card-header">
            {!isNameSet && (
              <h3 className="card-title">Set a Name</h3>
            )}

            {isNameSet && (
              <h3 className="card-title blue">{(currentContact.name)?currentContact.name:'Talk to Stranger'} </h3>
            )}
            {isNameSet && (
              <div className="card-tools">
                <span data-toggle="tooltip" title="3 New Messages" className="badge badge-primary hide">3</span>
                <button type="button" className="btn btn-tool" data-card-widget="collapse">
                  <i className="fas fa-minus"></i>
                </button>
                <button ref={this.btnContact} type="button" className="btn btn-tool" data-toggle="tooltip" title="Contacts"
                        data-widget="chat-pane-toggle">
                  <i className="fas fa-comments"></i>
                </button>
                <button type="button" className="btn btn-tool hide" data-card-widget="remove"><i className="fas fa-times"></i>
                </button>
              </div>
            )}



          </div>

          <div className="card-body">
            {isNameSet && (
              <div className="direct-chat-messages" >
                {(currentMessages.length === 0) && (
                  <div className="text-center blue">: No Message :</div>
                )}

                {currentMessages.map((cm,i)=>
                  <div className={(cm.from === currentUser.uid)?'direct-chat-msg right':'direct-chat-msg'} key={i}>
                    <div className="direct-chat-infos clearfix">
                      <span className={(cm.from === currentUser.uid)?'direct-chat-name float-right':'direct-chat-name float-left'}
                      >{cm.from_name}</span>
                      <span className={(cm.from === currentUser.uid)?'direct-chat-timestamp float-left':'direct-chat-timestamp float-right'}>{ this.getTimeString(cm.date_sent) }</span>
                    </div>
                    <img className="direct-chat-img" src={DEFAULT_IMAGE_URL} alt="meaningful :D"/>
                    <div className="direct-chat-text">
                      {cm.messageText}
                    </div>
                  </div>
                )}
                <div ref={this.messagesEnd} />

              </div>
            )}

            {isNameSet &&  (
              <div className="direct-chat-contacts">
                {(Object.keys(userMap).length===1) && (
                  <div className="text-center">: No Stranger :</div>
                )}
                <ul className="contacts-list">
                  {Object.keys(userMap).reverse().map((key, i)=>
                    <li onClick={() => this.selectCurrentContact(key)} key={key} className={(userMap[key].uid === currentUser.uid)?"hide":""}>
                      <img className="contacts-list-img" src={DEFAULT_IMAGE_URL} alt="meaningful :D"/>
                      <div className="contacts-list-info">
                        <span className="contacts-list-name">{userMap[key].name}
                          <small className="contacts-list-date float-right">{(userMap[key].messageText)?this.getTimeString(userMap[key].date_sent):""}</small>
                        </span>
                        <span className="contacts-list-msg">{(userMap[key].messageText)?userMap[key].messageText:""}</span>
                      </div>
                    </li>
                  )}
                  
                </ul>
              </div>
            )}


          </div>
          <div className="card-footer">
            {isNameSet && (
              <form ref={this.dcForm} onSubmit={this.fSendDcMessage}>
                <div className="input-group">
                  <input type="text" ref={this.dcText} placeholder="Type Message" className="form-control"/>
                  <span className="input-group-append">
                    <button type="button" onClick={this.fSendDcMessage} className="btn btn-primary">Send</button>
                  </span>
                </div>
              </form>
            )}
            {!isNameSet && (
              <form ref={this.loginForm} onSubmit={this.fLoginUser}>
                <div className="input-group">
                  <input type="text" ref={this.loginText} placeholder="What's your name" className="form-control"/>
                  <span className="input-group-append">
                    <button type="button" onClick={this.fLoginUser} className="btn btn-primary">Set Name</button>
                  </span>
                </div>
              </form>
            )}
          </div>

        </div>
        <div className="text-center"><small>Data here are meant to be volatile and not a single datum is being saved.</small></div>
      </div>
    );
  }
}

export default App;
