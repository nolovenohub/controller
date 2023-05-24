class InputController {
    constructor(actionsToBind = {}, target = null) {

        this.enabled = true
        this.focused = true
        this.actions = {}
        this.target = target

        this.ACTION_ACTIVATED = "input-controller:action-activated"
        this.ACTION_DEACTIVATED = "input-controller:action-deactivated"
        
        this.bindActions(actionsToBind)

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        if (target) {
            this.attach(target)
        }
    }

    bindActions(actionsToBind) {
        for (const actionName in actionsToBind) {
            if (actionsToBind.hasOwnProperty(actionName)) {
                const {keys, enabled = true} = actionsToBind[actionName]
                this.actions[actionName] = {
                    keys,
                    enabled,
                    active: false
                }
            }
        }
    }

    enableAction(actionName) {
        if (this.actions.hasOwnProperty(actionName)) {
            this.actions[actionName].enabled = true
        }
    }

    disableAction(actionName) {
        if (this.actions.hasOwnProperty(actionName)) {
            this.actions[actionName].enabled = false
            this.actions[actionName].active = false
        }
    }

    attach(target, dontEnable = false) {
        if (target) {
            this.handleKeyDown = this.handleKeyDown.bind(this)
            this.handleKeyUp = this.handleKeyUp.bind(this)

            target.addEventListener("keydown", this.handleKeyDown)
            target.addEventListener("keyup", this.handleKeyUp)

            this.target = target;
            this.focused = true

            if (!dontEnable) {
                this.enable()
            }
        }
    }

    detach() {
        if (this.target) {
            this.target.removeEventListener("keydown", this.handleKeyDown);
            this.target.removeEventListener("keyup", this.handleKeyUp);
            this.disable();
            this.focused = false;
            this.target = null;
        }
    }

    isAction(action) {
        if (this.actions.hasOwnProperty(action) && this.enabled && this.focused) {
            return this.actions[action].active
        }
        return false
    }

    isKeyPressed(keyCode) {
        if (this.enabled && this.focused) {
            for (const actionName in this.actions) {
                if (this.actions.hasOwnProperty(actionName)) {
                    const {keys, enabled, active} = this.actions[actionName]
                    if (enabled && keys.includes(keyCode)) {
                        return active
                    }
                }
            }
        }
        return false
    }

    enable() {
        this.enabled = true
    }

    disable() {
        this.enabled = false
        for (const actionName in this.actions) {
            if (this.actions.hasOwnProperty(actionName)) {
                this.actions[actionName].active = false
            }
        }
    }
    
    handleKeyDown(e){
        this.handleEvent(e, true)
    }

    handleKeyUp(e){
        this.handleEvent(e, false)
    }

    handleEvent(e, isKeyDown){
        if(this.enabled && this.focused){
            const {key, keyCode} = e
            for(const actionName in this.actions){
                if(this.actions.hasOwnProperty(actionName)){
                    const {keys, enabled} = this.actions[actionName]
                    if(enabled && keys.includes(key)){
                        const isACtive = this.actions[actionName].action
                        if(isACtive !== isKeyDown){
                            this.actions[actionName].active = isKeyDown
                            const eventName = isKeyDown ? this.ACTION_ACTIVATED : this.ACTION_DEACTIVATED
                            this.target.dispatchEvent(new CustomEvent(eventName, {detail: actionName}))
                        }
                        e.preventDefault()
                        return
                    }
                }
            }
        }
    }

    dispatchEvent(eventName, actionName) {
        if (this.target) {
            const event = new CustomEvent(eventName, {detail: actionName});
            document.dispatchEvent(event);
        }
    }
}
