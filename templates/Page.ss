<!DOCTYPE html>
<html lang="en">

<head>
  <% base_tag %>
  <title><% if $MetaTitle %>$MetaTitle<% else %>$Title<% end_if %> &raquo; $SiteConfig.Title</title>
  $MetaTags(false)
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, shrink-to-fit=no"
  />
  <% include FavIcon %>
  <% require themedCSS('dist/css/main') %>
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
</head>
<body>
  <% include SiteAlert %>
  <% include NoScriptAlert %>
  $Layout
</body>
<% require themedJavascript('dist/js/vendors.bundle') %>
<% require themedJavascript('dist/js/common.bundle') %>
</html>
