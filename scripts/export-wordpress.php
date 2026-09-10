<?php
// Run inside the old WordPress installation:
// wp eval-file scripts/export-wordpress.php > vulplink-export.json
$categories = get_terms(['taxonomy'=>'product_category','hide_empty'=>false]);
$category_rows = array_map(function($term){ return ['legacy_id'=>$term->term_id,'name'=>$term->name,'slug'=>$term->slug,'description'=>$term->description,'parent_legacy_id'=>$term->parent?:null]; }, is_wp_error($categories)?[]:$categories);
$products = [];
foreach (get_posts(['post_type'=>'product','posts_per_page'=>-1,'post_status'=>['publish','draft'],'orderby'=>'menu_order title','order'=>'ASC']) as $post) {
  $terms = wp_get_object_terms($post->ID,'product_category',['fields'=>'ids']);
  $tags = wp_get_object_terms($post->ID,'post_tag',['fields'=>'names']);
  $variants = get_post_meta($post->ID,'_product_variants',true);
  $main_id = get_post_meta($post->ID,'_product_main_image_id',true) ?: get_post_thumbnail_id($post->ID);
  $gallery_ids = array_filter(explode(',',get_post_meta($post->ID,'_product_gallery_ids',true)));
  $products[] = [
    'title'=>$post->post_title,'slug'=>$post->post_name,'excerpt'=>$post->post_excerpt,
    'description'=>get_post_meta($post->ID,'_product_description',true) ?: $post->post_content,
    'main_image_url'=>$main_id?wp_get_attachment_image_url($main_id,'full'):'',
    'gallery_urls'=>array_values(array_filter(array_map(fn($id)=>wp_get_attachment_image_url((int)$id,'full'),$gallery_ids))),
    'contact_email'=>get_post_meta($post->ID,'_product_contact_email',true),
    'certifications'=>get_post_meta($post->ID,'_product_certifications',true),
    'tags'=>is_wp_error($tags)?[]:$tags,'variants'=>is_array($variants)?$variants:[],
    'published'=>$post->post_status==='publish','sort_order'=>(int)$post->menu_order,
    'category_legacy_ids'=>is_wp_error($terms)?[]:$terms,
  ];
}
$setting = fn($key,$default='') => get_theme_mod('vulplink_'.$key,$default);
$hero=[];$about=[];for($i=1;$i<=5;$i++){if($v=$setting("hero_slide_$i"))$hero[]=$v;if($v=$setting("about_image_$i"))$about[]=$v;}
echo json_encode(['categories'=>$category_rows,'products'=>$products,'settings'=>[
  'sales_email'=>$setting('sales_email','sales@vulplink.com'),'sales_phone'=>$setting('sales_phone','+1 (800) 000-0000'),
  'support_email'=>$setting('support_email','support@vulplink.com'),'support_phone'=>$setting('support_phone','+1 (800) 000-0001'),
  'address'=>$setting('address',''),'hero_slides'=>$hero,'about_images'=>$about,'contact_bg'=>$setting('contact_bg','')
]], JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
