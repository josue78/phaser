var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="Basic.ts" />
/// <reference path="Game.ts" />
/**
* Phaser - Group
*
* This class is used for organising, updating and sorting game objects.
*/
var Phaser;
(function (Phaser) {
    var Group = (function (_super) {
        __extends(Group, _super);
        function Group(game, MaxSize) {
            if (typeof MaxSize === "undefined") { MaxSize = 0; }
            _super.call(this, game);
            /**
            * You can set a globalCompositeOperation that will be applied before the render method is called on this Groups children.
            * This is useful if you wish to apply an effect like 'lighten' to a whole group of children as it saves doing it one-by-one.
            * If this value is set it will call a canvas context save and restore before and after the render pass.
            * Set to null to disable.
            */
            this.globalCompositeOperation = null;
            /**
            * You can set an alpha value on this Group that will be applied before the render method is called on this Groups children.
            * This is useful if you wish to alpha a whole group of children as it saves doing it one-by-one.
            * Set to 0 to disable.
            */
            this.alpha = 0;
            this.isGroup = true;
            this.members = [];
            this.length = 0;
            this._maxSize = MaxSize;
            this._marker = 0;
            this._sortIndex = null;
            this.cameraBlacklist = [];
        }
        Group.ASCENDING = -1;
        Group.DESCENDING = 1;
        Group.prototype.hideFromCamera = /**
        * If you do not wish this object to be visible to a specific camera, pass the camera here.
        *
        * @param camera {Camera} The specific camera.
        */
        function (camera) {
            if(this.cameraBlacklist.indexOf(camera.ID) == -1) {
                this.cameraBlacklist.push(camera.ID);
            }
        };
        Group.prototype.showToCamera = /**
        * Make this object only visible to a specific camera.
        *
        * @param camera {Camera} The camera you wish it to be visible.
        */
        function (camera) {
            if(this.cameraBlacklist.indexOf(camera.ID) !== -1) {
                this.cameraBlacklist.slice(this.cameraBlacklist.indexOf(camera.ID), 1);
            }
        };
        Group.prototype.clearCameraList = /**
        * This clears the camera black list, making the GameObject visible to all cameras.
        */
        function () {
            this.cameraBlacklist.length = 0;
        };
        Group.prototype.destroy = /**
        * Override this function to handle any deleting or "shutdown" type operations you might need,
        * such as removing traditional Flash children like Basic objects.
        */
        function () {
            if(this.members != null) {
                var basic;
                var i = 0;
                while(i < this.length) {
                    basic = this.members[i++];
                    if(basic != null) {
                        basic.destroy();
                    }
                }
                this.members.length = 0;
            }
            this._sortIndex = null;
        };
        Group.prototype.update = /**
        * Automatically goes through and calls update on everything you added.
        */
        function (forceUpdate) {
            if (typeof forceUpdate === "undefined") { forceUpdate = false; }
            if(this.ignoreGlobalUpdate && forceUpdate == false) {
                return;
            }
            var basic;
            var i = 0;
            while(i < this.length) {
                basic = this.members[i++];
                if((basic != null) && basic.exists && basic.active && basic.ignoreGlobalUpdate == false) {
                    basic.preUpdate();
                    basic.update(forceUpdate);
                    basic.postUpdate();
                }
            }
        };
        Group.prototype.render = /**
        * Automatically goes through and calls render on everything you added.
        */
        function (camera, cameraOffsetX, cameraOffsetY, forceRender) {
            if (typeof forceRender === "undefined") { forceRender = false; }
            if(this.cameraBlacklist.indexOf(camera.ID) !== -1) {
                return;
            }
            if(this.ignoreGlobalRender && forceRender == false) {
                return;
            }
            if(this.globalCompositeOperation) {
                this._game.stage.context.save();
                this._game.stage.context.globalCompositeOperation = this.globalCompositeOperation;
            }
            if(this.alpha > 0) {
                var prevAlpha = this._game.stage.context.globalAlpha;
                this._game.stage.context.globalAlpha = this.alpha;
            }
            var basic;
            var i = 0;
            while(i < this.length) {
                basic = this.members[i++];
                if((basic != null) && basic.exists && basic.visible && basic.ignoreGlobalRender == false) {
                    basic.render(camera, cameraOffsetX, cameraOffsetY, forceRender);
                }
            }
            if(this.alpha > 0) {
                this._game.stage.context.globalAlpha = prevAlpha;
            }
            if(this.globalCompositeOperation) {
                this._game.stage.context.restore();
            }
        };
        Object.defineProperty(Group.prototype, "maxSize", {
            get: /**
            * The maximum capacity of this group.  Default is 0, meaning no max capacity, and the group can just grow.
            */
            function () {
                return this._maxSize;
            },
            set: /**
            * @private
            */
            function (Size) {
                this._maxSize = Size;
                if(this._marker >= this._maxSize) {
                    this._marker = 0;
                }
                if((this._maxSize == 0) || (this.members == null) || (this._maxSize >= this.members.length)) {
                    return;
                }
                //If the max size has shrunk, we need to get rid of some objects
                var basic;
                var i = this._maxSize;
                var l = this.members.length;
                while(i < l) {
                    basic = this.members[i++];
                    if(basic != null) {
                        basic.destroy();
                    }
                }
                this.length = this.members.length = this._maxSize;
            },
            enumerable: true,
            configurable: true
        });
        Group.prototype.add = /**
        * Adds a new <code>Basic</code> subclass (Basic, GameObject, Sprite, etc) to the group.
        * Group will try to replace a null member of the array first.
        * Failing that, Group will add it to the end of the member array,
        * assuming there is room for it, and doubling the size of the array if necessary.
        *
        * <p>WARNING: If the group has a maxSize that has already been met,
        * the object will NOT be added to the group!</p>
        *
        * @param {Basic} Object The object you want to add to the group.
        * @return {Basic} The same <code>Basic</code> object that was passed in.
        */
        function (Object) {
            //Don't bother adding an object twice.
            if(this.members.indexOf(Object) >= 0) {
                return Object;
            }
            //First, look for a null entry where we can add the object.
            var i = 0;
            var l = this.members.length;
            while(i < l) {
                if(this.members[i] == null) {
                    this.members[i] = Object;
                    if(i >= this.length) {
                        this.length = i + 1;
                    }
                    return Object;
                }
                i++;
            }
            //Failing that, expand the array (if we can) and add the object.
            if(this._maxSize > 0) {
                if(this.members.length >= this._maxSize) {
                    return Object;
                } else if(this.members.length * 2 <= this._maxSize) {
                    this.members.length *= 2;
                } else {
                    this.members.length = this._maxSize;
                }
            } else {
                this.members.length *= 2;
            }
            //If we made it this far, then we successfully grew the group,
            //and we can go ahead and add the object at the first open slot.
            this.members[i] = Object;
            this.length = i + 1;
            return Object;
        };
        Group.prototype.recycle = /**
        * Recycling is designed to help you reuse game objects without always re-allocating or "newing" them.
        *
        * <p>If you specified a maximum size for this group (like in Emitter),
        * then recycle will employ what we're calling "rotating" recycling.
        * Recycle() will first check to see if the group is at capacity yet.
        * If group is not yet at capacity, recycle() returns a new object.
        * If the group IS at capacity, then recycle() just returns the next object in line.</p>
        *
        * <p>If you did NOT specify a maximum size for this group,
        * then recycle() will employ what we're calling "grow-style" recycling.
        * Recycle() will return either the first object with exists == false,
        * or, finding none, add a new object to the array,
        * doubling the size of the array if necessary.</p>
        *
        * <p>WARNING: If this function needs to create a new object,
        * and no object class was provided, it will return null
        * instead of a valid object!</p>
        *
        * @param {class} ObjectClass The class type you want to recycle (e.g. Basic, EvilRobot, etc). Do NOT "new" the class in the parameter!
        *
        * @return {any} A reference to the object that was created.  Don't forget to cast it back to the Class you want (e.g. myObject = myGroup.recycle(myObjectClass) as myObjectClass;).
        */
        function (ObjectClass) {
            if (typeof ObjectClass === "undefined") { ObjectClass = null; }
            var basic;
            if(this._maxSize > 0) {
                if(this.length < this._maxSize) {
                    if(ObjectClass == null) {
                        return null;
                    }
                    return this.add(new ObjectClass(this._game));
                } else {
                    basic = this.members[this._marker++];
                    if(this._marker >= this._maxSize) {
                        this._marker = 0;
                    }
                    return basic;
                }
            } else {
                basic = this.getFirstAvailable(ObjectClass);
                if(basic != null) {
                    return basic;
                }
                if(ObjectClass == null) {
                    return null;
                }
                return this.add(new ObjectClass(this._game));
            }
        };
        Group.prototype.remove = /**
        * Removes an object from the group.
        *
        * @param {Basic} object The <code>Basic</code> you want to remove.
        * @param {boolean} splice Whether the object should be cut from the array entirely or not.
        *
        * @return {Basic} The removed object.
        */
        function (object, splice) {
            if (typeof splice === "undefined") { splice = false; }
            var index = this.members.indexOf(object);
            if((index < 0) || (index >= this.members.length)) {
                return null;
            }
            if(splice) {
                this.members.splice(index, 1);
                this.length--;
            } else {
                this.members[index] = null;
            }
            return object;
        };
        Group.prototype.replace = /**
        * Replaces an existing <code>Basic</code> with a new one.
        *
        * @param {Basic} oldObject	The object you want to replace.
        * @param {Basic} newObject	The new object you want to use instead.
        *
        * @return {Basic} The new object.
        */
        function (oldObject, newObject) {
            var index = this.members.indexOf(oldObject);
            if((index < 0) || (index >= this.members.length)) {
                return null;
            }
            this.members[index] = newObject;
            return newObject;
        };
        Group.prototype.sort = /**
        * Call this function to sort the group according to a particular value and order.
        * For example, to sort game objects for Zelda-style overlaps you might call
        * <code>myGroup.sort("y",Group.ASCENDING)</code> at the bottom of your
        * <code>State.update()</code> override.  To sort all existing objects after
        * a big explosion or bomb attack, you might call <code>myGroup.sort("exists",Group.DESCENDING)</code>.
        *
        * @param {string} index The <code>string</code> name of the member variable you want to sort on.  Default value is "y".
        * @param {number} order A <code>Group</code> constant that defines the sort order.  Possible values are <code>Group.ASCENDING</code> and <code>Group.DESCENDING</code>.  Default value is <code>Group.ASCENDING</code>.
        */
        function (index, order) {
            if (typeof index === "undefined") { index = "y"; }
            if (typeof order === "undefined") { order = Phaser.Group.ASCENDING; }
            this._sortIndex = index;
            this._sortOrder = order;
            this.members.sort(this.sortHandler);
        };
        Group.prototype.setAll = /**
        * Go through and set the specified variable to the specified value on all members of the group.
        *
        * @param {string} VariableName	The string representation of the variable name you want to modify, for example "visible" or "scrollFactor".
        * @param {Object} Value The value you want to assign to that variable.
        * @param {boolean} Recurse	Default value is true, meaning if <code>setAll()</code> encounters a member that is a group, it will call <code>setAll()</code> on that group rather than modifying its variable.
        */
        function (VariableName, Value, Recurse) {
            if (typeof Recurse === "undefined") { Recurse = true; }
            var basic;
            var i = 0;
            while(i < length) {
                basic = this.members[i++];
                if(basic != null) {
                    if(Recurse && (basic.isGroup == true)) {
                        basic['setAll'](VariableName, Value, Recurse);
                    } else {
                        basic[VariableName] = Value;
                    }
                }
            }
        };
        Group.prototype.callAll = /**
        * Go through and call the specified function on all members of the group.
        * Currently only works on functions that have no required parameters.
        *
        * @param {string} FunctionName	The string representation of the function you want to call on each object, for example "kill()" or "init()".
        * @param {boolean} Recurse	Default value is true, meaning if <code>callAll()</code> encounters a member that is a group, it will call <code>callAll()</code> on that group rather than calling the group's function.
        */
        function (FunctionName, Recurse) {
            if (typeof Recurse === "undefined") { Recurse = true; }
            var basic;
            var i = 0;
            while(i < this.length) {
                basic = this.members[i++];
                if(basic != null) {
                    if(Recurse && (basic.isGroup == true)) {
                        basic['callAll'](FunctionName, Recurse);
                    } else {
                        basic[FunctionName]();
                    }
                }
            }
        };
        Group.prototype.forEach = /**
        * @param {function} callback
        * @param {boolean} recursive
        */
        function (callback, recursive) {
            if (typeof recursive === "undefined") { recursive = false; }
            var basic;
            var i = 0;
            while(i < this.length) {
                basic = this.members[i++];
                if(basic != null) {
                    if(recursive && (basic.isGroup == true)) {
                        basic.forEach(callback, true);
                    } else {
                        callback.call(this, basic);
                    }
                }
            }
        };
        Group.prototype.forEachAlive = /**
        * @param {any} context
        * @param {function} callback
        * @param {boolean} recursive
        */
        function (context, callback, recursive) {
            if (typeof recursive === "undefined") { recursive = false; }
            var basic;
            var i = 0;
            while(i < this.length) {
                basic = this.members[i++];
                if(basic != null && basic.alive) {
                    if(recursive && (basic.isGroup == true)) {
                        basic.forEachAlive(context, callback, true);
                    } else {
                        callback.call(context, basic);
                    }
                }
            }
        };
        Group.prototype.getFirstAvailable = /**
        * Call this function to retrieve the first object with exists == false in the group.
        * This is handy for recycling in general, e.g. respawning enemies.
        *
        * @param {any} [ObjectClass] An optional parameter that lets you narrow the results to instances of this particular class.
        *
        * @return {any} A <code>Basic</code> currently flagged as not existing.
        */
        function (ObjectClass) {
            if (typeof ObjectClass === "undefined") { ObjectClass = null; }
            var basic;
            var i = 0;
            while(i < this.length) {
                basic = this.members[i++];
                if((basic != null) && !basic.exists && ((ObjectClass == null) || (typeof basic === ObjectClass))) {
                    return basic;
                }
            }
            return null;
        };
        Group.prototype.getFirstNull = /**
        * Call this function to retrieve the first index set to 'null'.
        * Returns -1 if no index stores a null object.
        *
        * @return {number} An <code>int</code> indicating the first null slot in the group.
        */
        function () {
            var basic;
            var i = 0;
            var l = this.members.length;
            while(i < l) {
                if(this.members[i] == null) {
                    return i;
                } else {
                    i++;
                }
            }
            return -1;
        };
        Group.prototype.getFirstExtant = /**
        * Call this function to retrieve the first object with exists == true in the group.
        * This is handy for checking if everything's wiped out, or choosing a squad leader, etc.
        *
        * @return {Basic} A <code>Basic</code> currently flagged as existing.
        */
        function () {
            var basic;
            var i = 0;
            while(i < length) {
                basic = this.members[i++];
                if((basic != null) && basic.exists) {
                    return basic;
                }
            }
            return null;
        };
        Group.prototype.getFirstAlive = /**
        * Call this function to retrieve the first object with dead == false in the group.
        * This is handy for checking if everything's wiped out, or choosing a squad leader, etc.
        *
        * @return {Basic} A <code>Basic</code> currently flagged as not dead.
        */
        function () {
            var basic;
            var i = 0;
            while(i < this.length) {
                basic = this.members[i++];
                if((basic != null) && basic.exists && basic.alive) {
                    return basic;
                }
            }
            return null;
        };
        Group.prototype.getFirstDead = /**
        * Call this function to retrieve the first object with dead == true in the group.
        * This is handy for checking if everything's wiped out, or choosing a squad leader, etc.
        *
        * @return {Basic} A <code>Basic</code> currently flagged as dead.
        */
        function () {
            var basic;
            var i = 0;
            while(i < this.length) {
                basic = this.members[i++];
                if((basic != null) && !basic.alive) {
                    return basic;
                }
            }
            return null;
        };
        Group.prototype.countLiving = /**
        * Call this function to find out how many members of the group are not dead.
        *
        * @return {number} The number of <code>Basic</code>s flagged as not dead.  Returns -1 if group is empty.
        */
        function () {
            var count = -1;
            var basic;
            var i = 0;
            while(i < this.length) {
                basic = this.members[i++];
                if(basic != null) {
                    if(count < 0) {
                        count = 0;
                    }
                    if(basic.exists && basic.alive) {
                        count++;
                    }
                }
            }
            return count;
        };
        Group.prototype.countDead = /**
        * Call this function to find out how many members of the group are dead.
        *
        * @return {number} The number of <code>Basic</code>s flagged as dead.  Returns -1 if group is empty.
        */
        function () {
            var count = -1;
            var basic;
            var i = 0;
            while(i < this.length) {
                basic = this.members[i++];
                if(basic != null) {
                    if(count < 0) {
                        count = 0;
                    }
                    if(!basic.alive) {
                        count++;
                    }
                }
            }
            return count;
        };
        Group.prototype.getRandom = /**
        * Returns a member at random from the group.
        *
        * @param {number} StartIndex Optional offset off the front of the array. Default value is 0, or the beginning of the array.
        * @param {number} Length Optional restriction on the number of values you want to randomly select from.
        *
        * @return {Basic} A <code>Basic</code> from the members list.
        */
        function (StartIndex, Length) {
            if (typeof StartIndex === "undefined") { StartIndex = 0; }
            if (typeof Length === "undefined") { Length = 0; }
            if(Length == 0) {
                Length = this.length;
            }
            return this._game.math.getRandom(this.members, StartIndex, Length);
        };
        Group.prototype.clear = /**
        * Remove all instances of <code>Basic</code> subclass (Basic, Block, etc) from the list.
        * WARNING: does not destroy() or kill() any of these objects!
        */
        function () {
            this.length = this.members.length = 0;
        };
        Group.prototype.kill = /**
        * Calls kill on the group's members and then on the group itself.
        */
        function () {
            var basic;
            var i = 0;
            while(i < this.length) {
                basic = this.members[i++];
                if((basic != null) && basic.exists) {
                    basic.kill();
                }
            }
        };
        Group.prototype.sortHandler = /**
        * Helper function for the sort process.
        *
        * @param {Basic} Obj1 The first object being sorted.
        * @param {Basic} Obj2 The second object being sorted.
        *
        * @return {number} An integer value: -1 (Obj1 before Obj2), 0 (same), or 1 (Obj1 after Obj2).
        */
        function (Obj1, Obj2) {
            if(Obj1[this._sortIndex] < Obj2[this._sortIndex]) {
                return this._sortOrder;
            } else if(Obj1[this._sortIndex] > Obj2[this._sortIndex]) {
                return -this._sortOrder;
            }
            return 0;
        };
        return Group;
    })(Phaser.Basic);
    Phaser.Group = Group;    
})(Phaser || (Phaser = {}));