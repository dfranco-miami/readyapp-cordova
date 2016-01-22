var BookIt = BookIt || {};

BookIt.BookingsController = function () {
    this.localStorageKey = "bookit.bookings";
    this.$bookingsPage = null;
    this.$btnRefresh = null;
    this.$btnNew = null;
    this.$ctnErr = null;
    this.$bookingsListCtn = null;
    
    this.bookings = [];
    
    this.$bookingEditorPage = null;
    this.$btnSubmit = null;
    this.$bookingEditorCtnErr = null;
    this.$txtLocationId = null;
    this.$txtDateFrom = null;
    this.$txtDateTo = null;
    this.$txtAttendees = null;
    
};

BookIt.BookingsController.prototype.init = function () {
    this.$bookingsPage = $("#page-bookings");
    this.$btnRefresh = $("#btn-refresh", this.$bookingsPage);
    this.$btnNew = $("#btn-new", this.$bookingsPage);
    this.$ctnErr = $("#ctn-err", this.$bookingsPage);
    this.$bookingsListCtn = $("#bookings-list-ctn", this.$bookingsPage)
    
    this.$bookingEditorPage = $("#page-booking-editor");
    this.$btnSubmit = $("#btn-submit", this.$bookingEditorPage);
    this.$bookingEditorCtnErr = $("#ctn-err", this.$bookingEditorPage);
    this.$txtLocationId = $("#txt-location-id", this.$bookingEditorPage);
    this.$txtDateFrom = $("#txt-date-from", this.$bookingEditorPage);
    this.$txtDateTo = $("#txt-date-to", this.$bookingEditorPage);
    this.$txtAttendees = $("#txt-attendees", this.$bookingEditorPage);

    window.localStorage.setItem(this.localStorageKey,'');
};

BookIt.BookingsController.prototype.getBookingsFromLocalStorage = function () {

    var result = [];

    try {
        result = JSON.parse(window.localStorage.getItem(this.localStorageKey)) || [];
    } catch (e) {
        result = [];
    }

    return result;
};

BookIt.BookingsController.prototype.renderBookings = function () {
    var dateGroup,
        bookingDate,
        bookingsCount,
        booking,
        ul,
        li,
        liArray = [],
        lisString,
        view;

   this.$bookingsListCtn.empty();

   if (this.bookings.length === 0) {
       $("<p>No bookings found</p>").appendTo(this.$bookingsListCtn);
       return;
   }


   ul = $("<ul id=\"bookings-list\" data-role=\"listview\"></ul>").appendTo(this.$bookingsListCtn);

    for (i = 0; i < this.bookings.length; i += 1) {

        booking = this.bookings[i];

        bookingDate = (new Date(booking.dateTimeFrom).toDateString())

        if (dateGroup != bookingDate) {
            dateGroup = bookingDate;
            liArray.push("<li data-theme=\"b\" data-role=\"list-divider\">" + dateGroup + "</li>");            
        }

        li = "<li><a><div class=\"bi-list-item-secondary\"><p>" + (new Date(booking.dateTimeFrom)).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) +
           " to " + (new Date(booking.dateTimeTo)).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) + "</p></div>" +
                    "<div class=\"bi-list-item-primary\">" + booking.locationId + "</div></a></li>";

        liArray.push(li);
    }

    liString = liArray.join("");
    $(liString).appendTo(ul);

    ul.listview();

};

BookIt.BookingsController.prototype.showBookingsFromServer = function () {
    var me = this;
    this.getBookingsFromServer(
        function (resp) {
            window.localStorage.setItem(app.bookingsController.localStorageKey, JSON.stringify(resp.extras.bookings));
            me.bookings = resp.extras.bookings;
            me.renderBookings();
        },
        function (error) {
            $.mobile.loading("hide");
            console.log(error);
            // TODO: Use a friendlier error message below.
            me.$ctnErr.html("<p>Please try again in a few minutes.</p>");
            me.$ctnErr.addClass("bi-ctn-err").slideDown();
        }
    );
    
};

BookIt.BookingsController.prototype.showBookings = function () {

    this.bookings = this.getBookingsFromLocalStorage();

    // Retrieve from server if local storage empty and online (Add offline check).
    if (!this.bookings || this.bookings.length == 0) {

        this.showBookingsFromServer();  
    } else {

        this.renderBookings();
    }  
};

BookIt.BookingsController.prototype.getBookingsFromServer = function (successCallback, errorCallback) {
    var session = BookIt.Session.getInstance().get();

    if (!session) {
        return errorCallback({ err: BookIt.ApiMessages.SESSION_NOT_FOUND });
    }
    $.ajax({
        type: 'GET',
        url: BookIt.Settings.bookingsUrl,
        data: '',
        headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Auth-Token' : session.sessionId},
        success: successCallback,
        error: errorCallback
    });
};


BookIt.BookingsController.prototype.onRefreshCommand = function () {
    
    this.getBookingsFromServer(
        function (resp) {
            // TODO
        },
        function (error) {
            // TODO
        }
    );
};


/* -- booking editor --*/

BookIt.BookingsController.prototype.resetBookingEditorForm = function () {

    var invisibleStyle = "bi-invisible",
        invalidInputStyle = "bi-invalid-input";

    this.$bookingEditorCtnErr.html("");
    this.$bookingEditorCtnErr.removeClass().addClass(invisibleStyle);
    this.$txtLocationId.removeClass(invalidInputStyle);
    this.$txtDateFrom.removeClass(invalidInputStyle);
    this.$txtDateTo.removeClass(invalidInputStyle);
    this.$txtAttendees.removeClass(invalidInputStyle);
    
    this.$txtLocationId.val("");
    this.$txtDateFrom.val("");
    this.$txtDateTo.val("");
    this.$txtAttendees.val("");
};


BookIt.BookingsController.prototype.onSubmitCommand = function () {

    var session = BookIt.Session.getInstance().get();

    if (!session) {
        return errorCallback({ err: BookIt.ApiMessages.SESSION_NOT_FOUND });
    }
    
    
    var me = this,
        locationId = me.$txtLocationId.val().trim(),
        dateFrom = me.$txtDateFrom.val().trim(),
        dateTo = me.$txtDateTo.val().trim(),
        attendees = me.$txtAttendees.val().trim(),
        
        invalidInput = false,
        invisibleStyle = "bi-invisible",
        invalidInputStyle = "bi-invalid-input";

    // Reset styles.
    me.$bookingEditorCtnErr.removeClass().addClass(invisibleStyle);
    me.$txtLocationId.removeClass(invalidInputStyle);
    me.$txtDateFrom.removeClass(invalidInputStyle);
    me.$txtDateTo.removeClass(invalidInputStyle);
    me.$txtAttendees.removeClass(invalidInputStyle);
    
    // Flag each invalid field.
    if (locationId.length === 0) {
        me.$txtLocationId.addClass(invalidInputStyle);
        invalidInput = true;
    }
    
    // Make sure that all the required fields have values.
    if (invalidInput) {
        me.$bookingEditorCtnErr.html("<p>Please enter all the required fields.</p>");
        me.$bookingEditorCtnErr.addClass("bi-ctn-err").slideDown();
        return;
    }
    $.ajax({
        type: 'POST',
        url: BookIt.Settings.bookingsUrl+'/add',
        headers: {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Auth-Token' : session.sessionId},
        data: "locationId=" + locationId + "&dateTimeFrom=" + dateFrom + "&dateTimeTo=" + dateTo + "&numberOfAttendees=" + attendees,
        
        success: function (resp) {

            if (resp.success === true) {
                //add to books
                //render
                $.mobile.navigate("#page-bookings");
                return;
            } else {
                alert(resp.extras.msg);
                if (resp.extras.msg) {
                    switch (resp.extras.msg) {
                        case BookIt.ApiMessages.DB_ERROR:
                        default:
                            // TODO: Use a friendlier error message below.
                            me.$bookingEditorCtnErr.html("<p>Oops! BookIt had a problem and could not add.  Please try again in a few minutes.</p>");
                            me.$bookingEditorCtnErr.addClass("bi-ctn-err").slideDown();
                            break;
                        
                    }
                }
            }
        },
        error: function (e) {
            console.log(e);
            // TODO: Use a friendlier error message below.
            me.$bookingEditorCtnErr.html("<p>Oops! BookIt had a problem and could not add.  Please try again in a few minutes.</p>");
            me.$bookingEditorCtnErr.addClass("bi-ctn-err").slideDown();
        }
    });
};
/*BookIt.BookingsController.prototype.onBookingEditorSubmitCommand = function () {
    
    this.getBookingsFromServer(
        function (resp) {
            // TODO
        },
        function (error) {
            // TODO
        }
    );
};
*/