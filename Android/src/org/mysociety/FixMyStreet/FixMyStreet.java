package org.mysociety.FixMyStreet;

import android.os.Bundle;
import android.view.WindowManager;

import org.apache.cordova.*;

public class FixMyStreet extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        /* yes, we are using a magic number here but the version constants aren't defined
           until the relevant release so if you want to check against a version that's
           after your minimum target version you have to use the number :(
           in this case 11 is Honeycomb / 3.0 */
        if (android.os.Build.VERSION.SDK_INT <= 11) {
            /* If we leave the default on for android 2 then on the details screen it scrolls
               the details screen in such a way that you can't see where you are typing so
               we switch back to adjustPan. We don't want to use that all the time as adjustPan
               stops you scrolling the screen when the softKeyboard is displayed which is what
               we'd like to be able to do so people can scroll to see if there are other
               fields. */
        	getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);
        }
        super.loadUrl("file:///android_asset/www/src/index.html", 30000);
    }
}