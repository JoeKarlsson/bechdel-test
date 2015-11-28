import 'modernizr';
import 'fastclick';
import 'foundation';
import $ from 'jquery';

export function bootstrap() {
    $(document).foundation();

    var doc = document.documentElement;
    doc.setAttribute('data-useragent', navigator.userAgent);
}
